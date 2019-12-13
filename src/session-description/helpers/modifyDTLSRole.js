/* eslint-disable no-param-reassign */
/**
 * Function that modifies the DTLS role in answer sdp
 * This needs to be done until https://bugzilla.mozilla.org/show_bug.cgi?id=1240897 is released in Firefox 68
 * Estimated release date for Firefox 68 : 2019-07-09 (https://wiki.mozilla.org/Release_Management/Calendar)
 * @private
 */
const modifyDTLSRole = (state, sessionDescription) => {
  const { originalDTLSRole } = state;
  const { type } = sessionDescription;

  if (originalDTLSRole === null || type === 'offer') {
    return sessionDescription.sdp;
  }

  sessionDescription.sdp = sessionDescription.sdp.replace(/a=setup:[a-z]+/g, `a=setup:${originalDTLSRole}`);

  return sessionDescription.sdp;
};

export default modifyDTLSRole;
