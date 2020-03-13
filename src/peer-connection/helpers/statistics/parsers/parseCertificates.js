/**
 * Function that parses the raw stats from the RTCCertificateStats dictionary.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {Object} stats - Stats object.
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseCertificates = (output, stats) => {
  const { certificate, raw } = output;
  const keys = Object.keys(output.raw);
  let transportStats = null;

  for (let i = 0; i < keys.length; i += 1) {
    if (raw[keys[i]].type === 'transport') {
      transportStats = raw[keys[i]];
    }
  }

  if (transportStats) {
    certificate.srtpCipher = transportStats.srtpCipher;
    certificate.dtlsCipher = transportStats.dtlsCipher;
    certificate.tlsVersion = transportStats.tlsVersion;

    const { localCertificateId, remoteCertificateId } = transportStats;

    if (stats.id === localCertificateId) {
      certificate.local = {};
      certificate.local.base64Certificate = stats.base64Certificate;
      certificate.local.fingerprintAlgorithm = stats.fingerprintAlgorithm;
    } else if (stats.id === remoteCertificateId) {
      certificate.remote = {};
      certificate.remote.base64Certificate = stats.base64Certificate;
      certificate.remote.fingerprintAlgorithm = stats.fingerprintAlgorithm;
    }
  }
};

export default parseCertificates;
