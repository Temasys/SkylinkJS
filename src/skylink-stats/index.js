import appConfig from '../../configs/app';
import Skylink from '../index';
import logger from '../logger';
import MESSAGES from '../messages';

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
    const { fetch } = window;

    try {
      const initOptions = Skylink.getInitOptions();
      const { enableStatsGathering } = initOptions;

      if (enableStatsGathering) {
        fetch(`${appConfig.stats.statsBase}${endpoint}`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
    } catch (err) {
      logger.log.WARN(STATS_MODULE.ERRORS.POST_FAILED, err);
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
