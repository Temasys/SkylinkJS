import encryptHelpers from '../../encrypted-messaging/helpers';

const getMessageConfig = (roomState, targetPeerId) => {
  const config = encryptHelpers.getMessageConfig(roomState, targetPeerId);
  config.isPersistent = true;

  return config;
};

export default getMessageConfig;
