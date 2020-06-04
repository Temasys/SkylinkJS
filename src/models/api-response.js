/* eslint-disable camelcase */
import logger from '../logger/index';
import SkylinkRoom from './skylink-room';
import SkylinkUser from './skylink-user';
import { isAString } from '../utils/helpers';

const apiResponseInstance = {};

/**
 * @classdesc Class representing a Skylink API response.
 * @class SkylinkApiResponse
 * @private
 * @param {RawApiResponse} rawApiResponse - API response received from the API Server
 */
class SkylinkApiResponse {
  constructor(rawApiResponse) {
    if (isAString(rawApiResponse) && apiResponseInstance[rawApiResponse]) {
      return apiResponseInstance[rawApiResponse];
    }

    const {
      offer_constraints,
      pc_constraints,
      cid,
      apiOwner,
      ipSigserver,
      isPrivileged,
      autoIntroduce,
      httpPortList,
      httpsPortList,
      hasMCU,
      ipSigserverPath,
      hasPersistentMessage,
      room_key,
    } = rawApiResponse;

    if (!offer_constraints && !pc_constraints) {
      logger.log.ERROR(['API', null, 'init', 'pc_constraints or offer_constraints are null']);
    }
    logger.log.DEBUG(['API', null, 'init', 'Parsed Peer Connection constraints:'], JSON.parse(pc_constraints));
    logger.log.DEBUG(['API', null, 'init', 'Parsed Offer constraints'], JSON.parse(offer_constraints));

    /**
     * This is the cid received from API
     * @type {String}
     */
    this.key = cid;
    /**
     * The owner of the App Key
     * @type {String}
     */
    this.appKeyOwner = apiOwner;
    /**
     * If the App Key has privileged option enabled
     * @type {boolean}
     */
    this.isPrivileged = isPrivileged;
    /**
     * If the App Key has autoIntroduce option enabled
     * @type {boolean}
     */
    this.autoIntroduce = autoIntroduce;
    /**
     * The instance of SkylinkRoom
     * @type {SkylinkRoom}
     */
    this.room = new SkylinkRoom(rawApiResponse);
    /**
     * The instance of SkylinkUser
     * @type {SkylinkUser}
     */
    this.user = new SkylinkUser(rawApiResponse);
    /**
     * If the key has MCU enabled
     * @type Boolean
     */
    this.hasMCU = hasMCU;
    /**
     * The endpoint of the signaling server
     * @type {String}
     */
    this.socketServer = ipSigserver;
    /**
     * The socket server version path of the signaling server
     * @type {String}
     */
    this.socketServerPath = ipSigserverPath;
    /**
     * The socket server ports
     * @type {String}
     */
    this.socketPorts = {
      'http:': Array.isArray(httpPortList) && httpPortList.length > 0 ? httpPortList : [80, 3000],
      'https:': Array.isArray(httpsPortList) && httpsPortList.length > 0 ? httpsPortList : [443, 3443],
    };

    this.hasPersistentMessage = hasPersistentMessage;

    apiResponseInstance[room_key] = this;
  }

  // eslint-disable-next-line class-methods-use-this
  deleteApiResponseInstance(roomKey) {
    delete apiResponseInstance[roomKey];
  }
}

export default SkylinkApiResponse;
