/**
 * @classdesc Class representing a Skylink Room.
 * @class SkylinkRoom
 * @private
 */
class SkylinkRoom {
  /**
   * @param {RawApiResponse} rawApiResponse - API response received from the API Server
   * @private
   */
  constructor(rawApiResponse) {
    /**
     * The room's id
     * @type {String}
     */
    this.id = rawApiResponse.room_key;
    /**
     * The room's credentials
     * @type {String}
     */
    this.token = rawApiResponse.roomCred;
    /**
     * The room start time
     * @type {Date}
     */
    this.startDateTime = rawApiResponse.start;
    /**
     * The maximum allowed room duration
     * @type {number}
     */
    this.duration = rawApiResponse.len;
    /**
     * The room name
     * @type {String}
     */
    this.roomName = rawApiResponse.roomName;
    /**
     * The peer connection configuration
     * @type {{mediaConstraints: any, peerConstraints: any, offerConstraints: any, peerConfig: {iceServers: Array}, sdpConstraints: {mandatory: {OfferToReceiveAudio: boolean, OfferToReceiveVideo: boolean}}}}
     */
    this.connection = {
      peerConstraints: JSON.parse(rawApiResponse.pc_constraints),
      offerConstraints: JSON.parse(rawApiResponse.offer_constraints),
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true,
        },
      },
      peerConfig: {
        iceServers: [],
      },
      mediaConstraints: JSON.parse(rawApiResponse.media_constraints),
    };
  }

  /**
   * Get the ID/KEY of this room
   * @return {String} id - The generated ID of the room
   * @private
   */
  getRoomKey() {
    return this.id;
  }

  /**
   * Get the name of this room
   * @return {String} roomName - The name of this room
   * @private
   */
  getRoomName() {
    return this.roomName;
  }
}

export default SkylinkRoom;
