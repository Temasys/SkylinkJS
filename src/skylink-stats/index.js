import appConfig from '../../configs/app';
import Skylink from '../index';
import logger from '../logger';
import MESSAGES from '../messages';
import { TAGS } from '../constants';

/* eslint-disable class-methods-use-this */
/**
 * @class
 * @classdesc This class is used to post the stats data.
 * @private
 */
class SkylinkStats {
  constructor() {
    this.endpoints = appConfig.stats.endPoints;
    this.stats_buffer = {};
    this.bufferTimeout = false;
  }

  postStats(endpoint, data) {
    const { STATS_MODULE } = MESSAGES;
    const beSilentOnLogs = Skylink.getInitOptions().beSilentOnStatsLogs;

    try {
      const initOptions = Skylink.getInitOptions();
      const { enableStatsGathering } = initOptions;

      if (enableStatsGathering) {
        const postData = this.processData(data);
        this.postStatObj(endpoint, beSilentOnLogs, postData);
      }
    } catch (err) {
      logger.log.WARN(STATS_MODULE.ERRORS.POST_FAILED, err);
    }
  }

  processData(data) {
    if (Array.isArray(data)) {
      return {
        client_id: data[0].client_id,
        data,
      };
    }

    return data;
  }

  async postStatObj(endpoint, beSilentOnLogs, data) {
    const { fetch } = window;
    const statsResponse = await fetch(`${appConfig.stats.statsBase}${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!beSilentOnLogs) {
      statsResponse.json()
        .then((result) => {
          logger.log.INFO([null, TAGS.STATS, null, `${endpoint}`], result);
        });
    }
  }

  addToStatsBuffer(operation, data, url) {
    if (!this.stats_buffer[operation]) {
      this.stats_buffer[operation] = {};
      this.stats_buffer[operation].url = url;
      this.stats_buffer[operation].data = [];
    }

    const cloneData = Object.assign({}, data);
    this.stats_buffer[operation].data.push(cloneData);
  }

  manageStatsBuffer() {
    if (!this.bufferTimeout) {
      this.bufferTimeout = true;
      setInterval(() => {
        const operations = Object.keys(this.stats_buffer);
        for (let i = 0; i < operations.length; i += 1) {
          if (this.stats_buffer[operations[i]].data.length > 0) {
            this.postStats(this.stats_buffer[operations[i]].url, this.stats_buffer[operations[i]].data);
            this.stats_buffer[operations[i]].data = [];
          }
        }
      }, 5000);
    }
  }
}

export default SkylinkStats;
