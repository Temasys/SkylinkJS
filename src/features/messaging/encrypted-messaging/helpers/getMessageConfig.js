import messagingHelpers from '../../helpers/index';
import encryptHelpers from './index';

const getMessageConfig = (roomState, targetPeerId, encryptSecrets, selectedSecretId, isPersistent, peerSessionId) => {
  const config = messagingHelpers.getMessageConfig(roomState, targetPeerId, peerSessionId);

  if (encryptHelpers.utils.hasCrypto() && encryptHelpers.utils.canEncrypt(selectedSecretId, encryptSecrets)) {
    config.secretId = selectedSecretId;
  }

  if (isPersistent) {
    config.isPersistent = isPersistent;
  }

  return config;
};

export default getMessageConfig;
