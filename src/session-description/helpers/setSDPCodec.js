/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
import Skylink from '../../index';
import logger from '../../logger';
import * as constants from '../../constants';

const setSDPCodec = (targetMid, sessionDescription, roomKey, overrideSettings) => {
  const initOptions = Skylink.getInitOptions(roomKey);
  const parseFn = (type, codecSettings) => {
    const codec = typeof codecSettings === 'object' ? codecSettings.codec : codecSettings;
    let samplingRate = typeof codecSettings === 'object' ? codecSettings.samplingRate : null;
    let channels = typeof codecSettings === 'object' ? codecSettings.channels : null;

    if (codec === constants[type === 'audio' ? 'AUDIO_CODEC' : 'VIDEO_CODEC'].AUTO) {
      logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, `Not preferring any codec for ${type} streaming. Using browser selection.`]);
      return;
    }

    const mLine = sessionDescription.sdp.match(new RegExp('m=' + type + ' .*\r\n', 'gi'));

    if (!(Array.isArray(mLine) && mLine.length > 0)) {
      logger.log.ERROR([targetMid, 'RTCSessionDesription', sessionDescription.type, `Not preferring any codec for ${type} streaming as m= line is not found.`]);
      return;
    }

    const setLineFn = (codecsList, isSROk, isChnlsOk) => {
      if (Array.isArray(codecsList) && codecsList.length > 0) {
        if (!isSROk) {
          samplingRate = null;
        }
        if (!isChnlsOk) {
          channels = null;
        }
        logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Preferring "' + codec + '" (samplingRate: ' + (samplingRate || 'n/a') + ', channels: ' + (channels || 'n/a') + ') for "' + type + '" streaming.']);

        let line = mLine[0];
        const lineParts = line.replace('\r\n', '').split(' ');
        // Set the m=x x UDP/xxx
        line = lineParts[0] + ' ' + lineParts[1] + ' ' + lineParts[2] + ' ';
        // Remove them to leave the codecs only
        lineParts.splice(0, 3);
        // Loop for the codecs list to append first
        for (let i = 0; i < codecsList.length; i += 1) {
          const parts = (codecsList[i].split('a=rtpmap:')[1] || '').split(' ');
          if (parts.length < 2) {
            continue;
          }
          line += parts[0] + ' ';
        }
        // Loop for later fallback codecs to append
        for (let j = 0; j < lineParts.length; j += 1) {
          if (line.indexOf(' ' + lineParts[j]) > 0) {
            lineParts.splice(j, 1);
            j -= 1;
          } else if (sessionDescription.sdp.match(new RegExp('a=rtpmap:' + lineParts[j] + '\ ' + codec + '/.*\r\n', 'gi'))) {
            line += lineParts[j] + ' ';
            lineParts.splice(j, 1);
            j -= 1;
          }
        }
        // Append the rest of the codecs
        line += lineParts.join(' ') + '\r\n';
        sessionDescription.sdp = sessionDescription.sdp.replace(mLine[0], line);
        return true;
      }
    };

    // If samplingRate & channels
    if (samplingRate) {
      if (type === 'audio' && channels && setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ '
        + codec + '\/' + samplingRate + (channels === 1 ? '[\/1]*' : '\/' + channels) + '\r\n', 'gi')), true, true)) {
        return;
      } else if (setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codec + '\/' + samplingRate + '[\/]*.*\r\n', 'gi')), true)) {
        return;
      }
    }
    if (type === 'audio' && channels && setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codec + '\/.*\/' + channels + '\r\n', 'gi')), false, true)) {
      return;
    }

    setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codec + '\/.*\r\n', 'gi')));
  };

  parseFn('audio', overrideSettings ? overrideSettings.audio : initOptions.audioCodec);
  parseFn('video', overrideSettings ? overrideSettings.video : initOptions.videoCodec);

  return sessionDescription.sdp;
};

export default setSDPCodec;
