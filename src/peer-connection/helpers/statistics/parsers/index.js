import parseSelectedCandidatePair from './parseSelectedCandidatePair';
import parseCertificates from './parseCertificates';
import tabulateStats from './tabulateStats';
import parseCodecs from './parseCodecs';
import parseAudio from './parseAudio';
import parseVideo from './parseVideo';
import parseVideoE2EDelay from './parseVideoE2EDelay';

/**
 * @namespace PeerConnectionStatisticsParsers
 * @description Parser functions for PeerConnectionStatistics
 * @private
 * @type {{parseVideo: parseVideo, parseVideoE2EDelay: parseVideoE2EDelay, parseAudio: parseAudio, parseCodecs: parseCodecs, tabulateStats: tabulateStats, parseSelectedCandidatePair: parseSelectedCandidatePair, parseCertificates: parseCertificates}}
 */
const parsers = {
  parseSelectedCandidatePair,
  parseCertificates,
  tabulateStats,
  parseCodecs,
  parseAudio,
  parseVideo,
  parseVideoE2EDelay,
};

export default parsers;
