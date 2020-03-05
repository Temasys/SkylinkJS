const expect = require('chai').expect;
const sinon = require('sinon');
import byeHandler, { checksIfHealthTimerExists, handleICEConnectionStats, clearPeerInfo } from '../../../../../src/server-communication/signaling-server/message-handler/handlers/byeHandler';
import { roomStateNoPeerInformationsAndPeerConnections, roomStateWithPeerObjects, roomStateWithPeerMCUObjects, roomStateArgentinaWithPeerMCUObjects } from '../../../support/mocks/roomState';
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../../../../src/index';
import Done from '../../../support/doneWrapper';
import * as constants from '../../../../../src/constants';
import PeerConnection from '../../../../../src/peer-connection/index';
import SkylinkSignalingServer from '../../../../../src/server-communication/signaling-server/index';

describe('#byeHandler', () => {

  describe('when the state does not have peerConnection and peerInformations for a peerId', () => {
    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(Skylink, 'getSkylinkState').returns(roomStateNoPeerInformationsAndPeerConnections());
    });

    after(() => {
      stub.restore();
      sinon.restore();
    });

    it('drops the hangout peer since he or she is not connected anymore', () => {
      let message = { mid: '04jdjsdokxhs', rid: 'singapore' };

      let result = byeHandler(message)
      expect(result).to.be.undefined;
    });

  });

  describe('when peerId is not MCU', () => {
      let stub;

      before(() => {
        sinon.restore();
        stub = sinon.stub(Skylink, 'getSkylinkState').returns(roomStateWithPeerObjects());
      });

      after(() => {
        stub.restore();
        sinon.restore();
      });

      it('triggers peerLeft event', done => {
        let doneWrapper = new Done(done);
        let message = { mid: '04jdjsdokxhs', rid: 'singapore' };

        SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, evt => {
          doneWrapper.trigger();
        });

        byeHandler(message);
      });

  });

  describe('when there peerId is MCU', () => {
    let stubSignallingServer;
    let stubPeerConnection;

    beforeEach(() => {
      Skylink.setSkylinkState(roomStateArgentinaWithPeerMCUObjects(), 'argentina');
      let signalingServer = new SkylinkSignalingServer();
      stubSignallingServer = sinon.stub(signalingServer, 'offer').returns({ room: 'FFFFFF'});
      stubPeerConnection = sinon.stub(PeerConnection, 'createOffer').returns({ room: 'XXXXXXX' });
    });

    afterEach(() => {
      stubSignallingServer.restore();
      stubPeerConnection.restore();
    });

    it('hasMCU flag is set to false', () => {
      let message = { mid: 'MCU', rid: 'argentina' };

      byeHandler(message);

      expect(Skylink.getSkylinkState('argentina').hasMCU).to.be.false;
    });

    it('triggers serverPeerLeft event', done => {
      let doneWrapper = new Done(done);
      let message = { mid: 'MCU', rid: 'argentina' };

      SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_LEFT, evt => {
        doneWrapper.trigger();
      });

      byeHandler(message);
    });

    it('deletes peerConnections object for peerId', done => {
      let message = { mid: 'MCU', rid: 'argentina' };
      let doneWrapper = new Done(done);

      byeHandler(message);

      setTimeout(() => {
        expect(Skylink.getSkylinkState('argentina').peerConnections['MCU']).to.be.undefined;
        doneWrapper.trigger();
      }, 1000);
    });

    it('calls close data channels', () => {
      let spy = sinon.spy(PeerConnection, 'closeDataChannel');
      let message = { mid: 'MCU', rid: 'argentina' };

      byeHandler(message);

      expect(spy.called).to.be.true;
      spy.restore();
    });

  });

});

describe('#checksIfHealthTimerExists', () => {

  describe('when there is a peer connection', () => {

    describe('when the signaling state is different to close', () => {
      let spy;

      it('closes the peer connection', () => {
        let roomState = roomStateWithPeerObjects();
        spy = sinon.spy(roomState.peerConnections['04jdjsdokxhs'], 'close');

        checksIfHealthTimerExists(roomState, '04jdjsdokxhs');
        expect(spy.called).to.be.true;
        spy.restore();
      });

      describe('when the WEBRTC detected type is AppleWebKit', () => {

        before(() => {
          global.AdapterJS.webrtcDetectedType = 'AppleWebKit';
        });

        it('returns true if WEBRTC detected type is AppleWebKit', () => {
          let result = checksIfHealthTimerExists(roomStateWithPeerObjects(), '04jdjsdokxhs');
          expect(result).to.be.undefined;
        });

        describe('when the signaling state is not closed', () => {

          it('sets to true the peerConnection signalingStateClosed in close', () => {
            let roomState = roomStateWithPeerObjects();

            checksIfHealthTimerExists(roomState, '04jdjsdokxhs');
            expect(roomState.peerConnections['04jdjsdokxhs'].signalingStateClosed).to.be.true;
          });

          it('dispatches peerConnectionState events', done => {
            let doneWrapper = new Done(done);

            SkylinkEventManager.addEventListener(constants.EVENTS.PEER_CONNECTION_STATE, evt => {
              doneWrapper.trigger();
            });

            checksIfHealthTimerExists(roomStateWithPeerObjects(), '04jdjsdokxhs');
          });

        });

        describe('when the iceConnectionStateClosed state is not closed', () => {

          beforeEach(() => sinon.restore());
          afterEach(() => sinon.restore());

          it('sets iceConnectionStateClosed to true', () => {
            let roomState = roomStateWithPeerObjects();

            checksIfHealthTimerExists(roomState, '04jdjsdokxhs');
            expect(roomState.peerConnections['04jdjsdokxhs'].iceConnectionStateClosed).to.be.true;
          });

          it('calls handleIceConnectionStats', () => {
            let spy = sinon.spy(handleICEConnectionStats, 'send');

            checksIfHealthTimerExists(roomStateWithPeerObjects(), '04jdjsdokxhs');
            expect(spy.called).to.be.true;

            spy.restore();
          });

          it('dispatches iceConnectionState', done => {
            let doneWrapper = new Done(done);

            SkylinkEventManager.addEventListener(constants.EVENTS.ICE_CONNECTION_STATE, evt => {
              doneWrapper.trigger();
            });

            checksIfHealthTimerExists(roomStateWithPeerObjects(), '04jdjsdokxhs');
          });

        });

      });

    });

  });

  describe('when there is not a peer connection', () => {

    it('returns false', () => {
      let result = checksIfHealthTimerExists(roomStateNoPeerInformationsAndPeerConnections(), '04jdjsdokxhs');
      expect(result).to.be.undefined;
    });

  })

});

describe('#clearPeerInfo', () => {
  let stateStub;

  before(() => {
    sinon.restore();
    stateStub = sinon.stub(Skylink, 'getSkylinkState').returns(roomStateWithPeerObjects());
  });

  after(() => {
    stateStub.restore();
    sinon.restore();
  });

  it('deletes the peer associated objects', done => {
    let roomState = Skylink.getSkylinkState('singapore');
    let doneWrapper = new Done(done);

    clearPeerInfo(roomState, '04jdjsdokxhs');
    roomState = Skylink.getSkylinkState('singapore');

    setTimeout(() => {
      expect(roomState.peerConnections['04jdjsdokxhs']).to.be.undefined;
      doneWrapper.trigger();
    }, 1000);

    expect(roomState.peerInformations['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerMessagesStamps['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.streamsSession['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerEndOfCandidatesCounter['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerCandidatesQueue['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.sdpSessions['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerStats['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerBandwidth['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.gatheredCandidates['04jdjsdokxhs']).to.be.undefined;
    expect(roomState.peerConnStatus['04jdjsdokxhs']).to.be.undefined;
  });

})
