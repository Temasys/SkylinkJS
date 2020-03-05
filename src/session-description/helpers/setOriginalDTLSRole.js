import Skylink from '../../index';

/**
 * Function sets the original DTLS role which was negotiated on first offer/ansswer exchange
 * This needs to be done until https://bugzilla.mozilla.org/show_bug.cgi?id=1240897 is released in Firefox 68
 * Estimated release date for Firefox 68 : 2019-07-09 (https://wiki.mozilla.org/Release_Management/Calendar)
 * @private
 */
const setOriginalDTLSRole = (state, sessionDescription, isRemote) => {
  const { room } = state;
  const { type } = sessionDescription;
  const invertRoleMap = { active: 'passive', passive: 'active' };
  const aSetupPattern = sessionDescription.sdp.match(/a=setup:([a-z]+)/);

  if (state.originalDTLSRole !== null || type === 'offer') {
    return;
  }

  if (!aSetupPattern) {
    return;
  }

  const role = aSetupPattern[1];
  // eslint-disable-next-line
  state.originalDTLSRole = isRemote ? invertRoleMap[role] : role;
  Skylink.setSkylinkState(state, room.id);
};

export default setOriginalDTLSRole;
