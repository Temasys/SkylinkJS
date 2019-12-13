const expect = require('chai').expect;
const fetch = require('node-fetch');
const sinon = require('sinon');
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../../src/index';
import buildInitConfig from '../support/buildInitConfig';
import plugWebRTCToGlobalScope from '../support/plug-webrtc-to-global-scope';
import Done from '../support/doneWrapper';
import { Socket } from 'socket.io-client';
import { handleICEConnectionStats } from '../../../src/server-communication/signaling-server/message-handler/handlers/byeHandler';
import MediaStream from '../../../src/media-stream/index';

window.WebSocket = undefined;
window.io = { Socket: Socket };
window.fetch = global.fetch = fetch;
plugWebRTCToGlobalScope(global);

describe('#leaveRoom', () => {

  let sandbox;
  before(() => sandbox = sinon.createSandbox());

  after(() => sandbox.restore());

  describe('when there is a room name', () => {

    describe('when the user leaves a room that logged in', () => {
      let config;
      let skylink;

      beforeEach(done => {
        sandbox.restore();
        sandbox.stub(MediaStream, 'getUserMedia').resolves({});
        sandbox.stub(handleICEConnectionStats, 'send').withArgs(1,2,3).returns(true);

        config = buildInitConfig();
        skylink = new Skylink(config);

        skylink.joinRoom({ audio: true, video: true })
        .then(() => done());
      });

      after(() => sandbox.restore());

      it('cleans up skylinkStates', done => {
        let doneWrapper = new Done(done);

        SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, evt => {
          skylink.leaveRoom(config.defaultRoom)
          .then(result => {
            expect(result).to.be.true;
            doneWrapper.trigger();
          });
        });
      });

      it('emmits a peerLeft event', done => {
        let doneWrapper = new Done(done);

        SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, evt => {
          doneWrapper.trigger();
        });

        skylink.leaveRoom(config.defaultRoom)
      });

    });

    describe('when the user tries to leave a room that did not log in', () => {
      let config;
      let skylink;

      beforeEach(() => {
        sandbox.restore();
        config = buildInitConfig();
        skylink = new Skylink(config);
        sandbox.stub(MediaStream, 'getUserMedia').resolves({});
        skylink.joinRoom({ audio: true, video: true });
      });

      afterEach(() => sandbox.restore());

      it('rejects the promise with an error message', done => {
        let doneWrapper = new Done(done);


        SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, evt => {
          skylink.leaveRoom('xxxxxxxxxxxx')
          .catch(error => {
            expect(error.message).to.be.equals('We cannot leave a room that we did not login.');
            doneWrapper.trigger();
          });
        });
      });

    });

  });

  describe('when two peers are connected to the same room', () => {

    describe('when one of the peer is still in the room', () => {
      let roomName = (new Date ()).toISOString() + '-temasys-test-driven';
      let config = buildInitConfig({ defaultRoom: roomName });

      xit('receives a peerLeft message', done => {
        let doneWrapper = new Done(done);

        let skylinkClient1 = new Skylink(config);
        let skylinkClient2 = new Skylink(config);

        skylinkClient2.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, evt => {
          console.log(`************* Client 1 peerJoined. Is self: ${evt.detail.isSelf}`, evt.detail.peerId);
        });

        skylinkClient1.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, evt => {
          console.log(`************* Client 2 peerJoined. Is self: ${evt.detail.isSelf}`, evt.detail.peerId);
        });

        skylinkClient1.joinRoom({ audio: true, video: false });
        skylinkClient2.joinRoom({ audio: true, video: false });
      });

    });

  });

});
