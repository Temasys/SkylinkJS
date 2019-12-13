/**
 * Function that parses the raw stats from the RTCCertificateStats dictionary.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {String} prop - Stats dictionary identifier.
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseCertificates = (output, prop) => {
  const { raw, certificate } = output;
  if (raw[prop].type === 'certificate') {
    // Map other certificate data based on the fingerprint obtained from SessionDescription.getSDPFingerprint
    if (raw[prop].fingerprint === certificate.local.fingerprint) {
      certificate.local.base64Certificate = raw[prop].base64Certificate;
      certificate.local.fingerprintAlgorithm = raw[prop].fingerprintAlgorithm;
    } else if (raw[prop].fingerprint === certificate.remote.fingerprint) {
      certificate.remote.base64Certificate = raw[prop].base64Certificate;
      certificate.remote.fingerprintAlgorithm = raw[prop].fingerprintAlgorithm;
    }
  }
  // TODO:
  //  // FF has not implemented ceritificate
  //  // test for Plugin
  // else if (prop.indexOf('ssrc_') === 0 && raw[prop].transportId) { // raw[prop].type === 'stream' && raw[prop].ssrc ?
  //   const pairItem = raw[raw[prop].transportId] || {};
  //   certificate.srtpCipher = pairItem.srtpCipher;
  //   certificate.dtlsCipher = pairItem.dtlsCipher;
  //
  //   const localCertItem = raw[pairItem.localCertificateId || ''] || {};
  //   certificate.local.fingerprint = localCertItem.fingerprint;
  //   certificate.local.fingerprintAlgorithm = localCertItem.fingerprintAlgorithm;
  //   certificate.local.base64Certificate = localCertItem.base64Certificate;
  //
  //   const remoteCertItem = raw[pairItem.remoteCertificateId || ''] || {};
  //   certificate.remote.fingerprint = remoteCertItem.fingerprint;
  //   certificate.remote.fingerprintAlgorithm = remoteCertItem.fingerprintAlgorithm;
  //   certificate.remote.base64Certificate = remoteCertItem.base64Certificate;
  // }
};

export default parseCertificates;
