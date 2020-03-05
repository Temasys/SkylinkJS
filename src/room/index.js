import { leaveRoom, leaveAllRooms } from './leaveRoom';
import joinRoom from './joinRoom';
import { lockRoom, unlockRoom } from './lockRoom';

/**
 * @classdesc Class that contains the methods for Room.
 * @private
 */
class Room {
  /** @lends Room */
  static leaveRoom(args) {
    return leaveRoom(args);
  }

  static leaveAllRooms() {
    return leaveAllRooms();
  }

  static lockRoom(roomState) {
    return lockRoom(roomState);
  }

  static unlockRoom(roomState) {
    return unlockRoom(roomState);
  }

  static joinRoom(args) {
    return joinRoom(args);
  }
}

export default Room;
