import parseSelectedCandidatePair from './parseSelectedCandidatePair';
import parseCertificates from './parseCertificates';
import tabulateStats from './tabulateStats';
import parseAudio from './parseAudio';
import parseVideo from './parseVideo';
import parseMedia from './parseMedia';

/**
 * @namespace PeerConnectionStatisticsParsers
 * @description Parser functions for PeerConnectionStatistics
 * @private
 * @type {{parseVideo: parseVideo, parseAudio: parseAudio, tabulateStats: tabulateStats, parseSelectedCandidatePair: parseSelectedCandidatePair, parseCertificates: parseCertificates, parseMedia: parseMedia}}
 */
const parsers = {
  parseSelectedCandidatePair,
  parseCertificates,
  tabulateStats,
  parseAudio,
  parseVideo,
  parseMedia,
};

export default parsers;
