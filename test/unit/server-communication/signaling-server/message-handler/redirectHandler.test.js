const expect = require('chai').expect;
const sinon = require('sinon');
import * as redirectModule from '../../../../../src/server-communication/signaling-server/message-handler/handlers/redirectHandler';
import * as helpers from '../../../../../src/utils/helpers';
import SkylinkStates from '../../../../../src/skylink-states';
import { SkylinkEventManager, SkylinkConstants } from '../../../../../src/index';
import Done from '../../../support/doneWrapper';

describe('#redirect', () => {

  describe('when the message a action is reject', () => {

    let rejectMessage = {
      action: "reject",
      info: "Room locked",
      reason: "locked",
      rid: "xxxx",
      type: "redirect",
    };

    describe('when the user is connected to only one room', () => {
      let removeRoom;
      let disconnectSocket;

      before(() => {
        sinon.restore();
        removeRoom = sinon.stub(helpers, 'removeRoomStateByState').returns(true);
        disconnectSocket = sinon.stub(helpers, 'disconnect').returns(true);
      });

      after(() => {
        removeRoom.restore();
        disconnectSocket.restore();
        sinon.restore();
      });

      it('removes the state for the current room id', () => {
        redirectModule.redirectHandler(rejectMessage);
        expect(removeRoom.called);
      });

      it('closes the socket connection', () => {
        redirectModule.redirectHandler(rejectMessage);
        expect(disconnectSocket.called);
      });

    });

    describe('when the user is connected to more than one room', () => {
      let stubState;
      let removeRoom;
      let disconnectSocket;

      before(() => {
        sinon.restore();
        stubState = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns({'singaopore': {}, 'hongkong': {}, 'ny': {}});
        removeRoom = sinon.stub(helpers, 'removeRoomStateByState').returns(true);
        disconnectSocket = sinon.stub(helpers, 'disconnect').returns(true);
      });

      after(() => {
        stubState.restore();
        removeRoom.restore();
        disconnectSocket.restore();
        sinon.restore();
      });

      it('does not close the socket connection', () => {
        redirectModule.redirectHandler(rejectMessage);
        expect(disconnectSocket.notCalled);
      });

      it('removes the state for the current room id', () => {
        redirectModule.redirectHandler(rejectMessage);
        expect(removeRoom.called);
      });

    });

  });

  describe('when message reason is toClose', () => {
    let stubState;
    let removeRoom;
    let disconnectSocket;
    let rejectMessage = {
      action: "reject",
      info: "Room locked",
      reason: "toClose",
      rid: "xxxx",
      type: "redirect",
    };

    before(() => {
      sinon.restore();
      stubState = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns({'singaopore': {}, 'hongkong': {}, 'ny': {}});
      removeRoom = sinon.stub(helpers, 'removeRoomStateByState').returns(true);
      disconnectSocket = sinon.stub(helpers, 'disconnect').returns(true);
    });

    after(() => {
      stubState.restore();
      removeRoom.restore();
      disconnectSocket.restore();
      sinon.restore();
    });

    it('lowers case the reason message', done => {
      let doneWrapper = new Done(done);

      SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SYSTEM_ACTION, evt => {
        let reason = evt.detail.reason;
        expect(reason).to.be.equal('toclose');

        doneWrapper.trigger();
      });

      redirectModule.redirectHandler(rejectMessage);
    });

  })

  describe('system action event', () => {
    let stubState;
    let removeRoom;
    let disconnectSocket;
    let rejectMessage = {
      action: "reject",
      info: "Room locked",
      reason: "toClose",
      rid: "xxxx",
      type: "redirect",
    };

    before(() => {
      sinon.restore();
      stubState = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns({'singaopore': {}, 'hongkong': {}, 'ny': {}});
      removeRoom = sinon.stub(helpers, 'removeRoomStateByState').returns(true);
      disconnectSocket = sinon.stub(helpers, 'disconnect').returns(true);
    });

    after(() => {
      stubState.restore();
      removeRoom.restore();
      disconnectSocket.restore();
      sinon.restore();
    });

    it('triggers a systemAction event', done => {
      let doneWrapper = new Done(done);

      SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SYSTEM_ACTION, evt => {
        doneWrapper.trigger();
      });

      redirectModule.redirectHandler(rejectMessage);
    });
  });

});