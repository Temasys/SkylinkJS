import { startRecording, stopRecording } from './recording';

class Recording {
  static start(...args) {
    return startRecording(...args);
  }

  static stop(...args) {
    return stopRecording(...args);
  }

  static getRecordings(roomState) {
    const { recordings } = roomState;
    return Object.assign({}, recordings);
  }
}

export default Recording;
