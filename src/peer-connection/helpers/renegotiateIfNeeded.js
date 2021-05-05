import Skylink from '../../index';
import { isEmptyArray } from '../../utils/helpers';
import logger from '../../logger';
import { TAGS } from '../../constants';
import MESSAGES from '../../messages';

const renegotiateIfNeeded = (state, peerId) => {
  const { peerConnections, currentRTCRTPSenders, hasMCU } = state;
  const initOptions = Skylink.getInitOptions();

  // eslint-disable-next-line consistent-return
  return new Promise((resolve) => {
    const peerConnection = peerConnections[peerId];
    const pcSenders = peerConnection.getSenders() ? peerConnection.getSenders() : [];
    const senderGetStatsPromises = [];
    const savedSenders = currentRTCRTPSenders[peerId] || [];
    let isRenegoNeeded = false;

    // Stop the renegotiation as it will loop since transmittingSendersKeys !== savedSenders
    if (isEmptyArray(peerConnection.constraints.iceServers) && initOptions.forceTURN && !hasMCU) {
      logger.log.WARN([null, TAGS.PEER_CONNECTION, null, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.STOP_RENEGOTIATION_FORCE_TURN]);
      return resolve(isRenegoNeeded);
    }

    pcSenders.forEach((pcSender) => {
      senderGetStatsPromises.push(pcSender.getStats());
    });

    const transmittingSenders = {};

    Promise.all(senderGetStatsPromises).then((reslovedResults) => {
      reslovedResults.forEach((reports, senderIndex) => {
        reports.forEach((report) => {
          if (report && report.ssrc && report.bytesSent !== 0) {
            transmittingSenders[report.ssrc] = pcSenders[senderIndex];
          } else if (report && report.type === 'ssrc' && report.id.indexOf('send') > 1) { // required for retrieving sender information for react
            // native ios
            report.values.forEach((value) => {
              if (value.ssrc) {
                transmittingSenders[value.ssrc] = pcSenders[senderIndex];
              }
            });
          }
        });
      });

      const transmittingSendersKeys = Object.keys(transmittingSenders);

      if (transmittingSendersKeys.length !== savedSenders.length) {
        isRenegoNeeded = true;
      } else {
        let senderMatchedCount = 0;
        for (let tKey = 0; tKey < transmittingSendersKeys.length; tKey += 1) {
          const tSender = transmittingSenders[transmittingSendersKeys[tKey]];
          for (let sIndex = 0; sIndex < savedSenders.length; sIndex += 1) {
            const sSender = savedSenders[sIndex];
            if (tSender === sSender) {
              senderMatchedCount += 1;
              break;
            }
          }
        }
        isRenegoNeeded = senderMatchedCount !== transmittingSendersKeys.length;
      }
      resolve(isRenegoNeeded);
    });
  });
};

export default renegotiateIfNeeded;
