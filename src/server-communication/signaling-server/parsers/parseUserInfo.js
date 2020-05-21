const parseUserInfo = (state, msg, parsedMsg) => {
  const info = Object.assign({}, msg.userInfo);

  info.config = info.config ? info.config : {
    enableDataChannel: parsedMsg.enableDataChannel,
    enableIceRestart: parsedMsg.enableIceRestart,
    priorityWeight: parsedMsg.weight,
    receiveOnly: parsedMsg.receiveOnly,
    publishOnly: parsedMsg.publishOnly,
  };

  info.agent = info.agent ? info.agent : {
    name: parsedMsg.agent,
    version: parsedMsg.version,
    os: parsedMsg.os,
    pluginVersion: parsedMsg.temasysPluginVersion,
    SMProtocolVersion: parsedMsg.SMProtocolVersion,
    DTProtocolVersion: parsedMsg.DTProtocolVersion,
  };

  info.settings = info.settings ? info.settings : {};
  info.mediaStatus = info.mediaStatus ? info.mediaStatus : {};

  return info;
};

export default parseUserInfo;
