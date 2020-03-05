const expect = require('chai').expect;
const sinon = require('sinon');
import * as StopMediaTracksModule from '../../../../src/room/helpers/stopMediaTracks';
import { stopMediaTracks } from '../../../../src/media-stream/helpers/stopUserMediaStream';

import { mediaTrack, mediaTrackThrowsError } from '../../support/mocks/mediaTrack';
import { singaporeRoomState, singaporeAndHongKongRoomState } from '../../support/mocks/roomState';
import SkylinkStates from '../../../../src/skylink-states';

describe('#stopMediaTracks', () => {

  describe('when there are media tracks', () => {
    let mediaTracks = [mediaTrack(), mediaTrack()];

    it('stops the media tracks', () => {
      let result = stopMediaTracks(mediaTracks);
        expect(result).to.be.true;
      });
    });

  describe('when there are not media tracks', () => {

    it('returns false', () => {
      let result = stopMediaTracks([]);
      expect(result).to.be.false;
    });

  });

  describe('when there is an exeption', () => {

    it('keeps closing all the streams and returns true', () => {
      let result = stopMediaTracks([mediaTrackThrowsError()]);
      expect(result).to.true;
    });

  });

});

describe('#tryStopUserMediaStreamByRoomId', () => {

  describe('when there is an existing room given a room id', () => {
    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns(singaporeRoomState());
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns are true', () => {
      let result = StopMediaTracksModule.tryStopUserMediaStreamByRoomId('singapore');

      expect(result).to.be.true;
    });

  });

  describe('when there is no room given a room id', () => {

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopUserMediaStreamByRoomId('singapore');

      expect(result).to.be.true;
    });

  });

  describe('when there is not room', () => {

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopUserMediaStreamByRoomId('xxxxx');
      expect(result).to.be.true;
    });

  });

  describe('when there is not stream', () => {

    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns({
        singapore: {
          streams: {
          }
        }
      });
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopUserMediaStreamByRoomId('singapore');
      expect(result).to.be.true;
    });

  });

  describe('when there is not userMedia', () => {

    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns({
        singapore: {
          streams: {
          }
        }
      });
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopUserMediaStreamByRoomId('singapore');
      expect(result).to.be.true;
    });

  });

});


describe('#tryStopScreenshareStreamByRoomId', () => {

  describe('when there is not room', () => {

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopScreenshareStreamByRoomId('xxxxx');
      expect(result).to.be.true;
    });

  });

  describe('when there is not stream', () => {

    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns({
        singapore: {
          streams: {
          }
        }
      });
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopScreenshareStreamByRoomId('singapore');
      expect(result).to.be.true;
    });

  });

  describe('when there is not screenshare', () => {

    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns({
        singapore: {
          streams: {
          }
        }
      });
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopScreenshareStreamByRoomId('singapore');
      expect(result).to.be.true;
    });

  });

  describe('when there is an existing room given a room id', () => {

    let stub;

    before(() => {
      sinon.restore();
      stub = sinon.stub(SkylinkStates.prototype, 'getState').returns(singaporeRoomState());
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopScreenshareStreamByRoomId('singapore');

      expect(result).to.be.true;
    });

  });

  describe('when there is no room given a room id', () => {

    before(() => sinon.restore());

    it('returns true', () => {
      let result = StopMediaTracksModule.tryStopScreenshareStreamByRoomId('singapore');

      expect(result).to.be.true;
    });

  });

});

describe('#iAmInMoreThanOneRoom', () => {

  describe('when there is not state', () => {

    let stub;

    before(() => {
      sinon.restore()
      stub = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns({});
    });

    after(() => {
      stub.restore();
      sinon.restore();
    });

    it('returns false', () => {
      let result = StopMediaTracksModule.iAmInMoreThanOneRoom();

      expect(result).to.be.false;
    });

  });

  describe('when there is one state', () => {
    let stub;

    before(() => {
      sinon.restore()
      stub = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns(singaporeRoomState());
    });

    after(() => {
      stub.restore();
      sinon.restore();
    });

    it('returns false', () => {
      let result = StopMediaTracksModule.iAmInMoreThanOneRoom();

      expect(result).to.be.false
    });

  });

  describe('when there are two states', () => {
    let stub;

    before(() => {
      sinon.restore()
      stub = sinon.stub(SkylinkStates.prototype, 'getAllStates').returns(singaporeAndHongKongRoomState());
    });

    after(() => {
      stub.restore();
      sinon.restore();
    })

    it('returns true', () => {
      let result = StopMediaTracksModule.iAmInMoreThanOneRoom();

      expect(result).to.be.true
    });

  });

});
