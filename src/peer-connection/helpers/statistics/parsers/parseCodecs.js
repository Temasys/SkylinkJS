const parseCodecs = () => {
  // FIXME: Codecs being gathered from sdp in gatherSDPCodecs prior to getStats
  // for Chrome and FF

  // const { raw } = output;
  // Plugin
  // if (prop.indexOf('ssrc_') === 0) {
  // const direction = prop.indexOf('_send') > 0 ? 'sending' : 'receiving';
  //
  // raw[prop].codecImplementationName = raw[prop].codecImplementationName === 'unknown' ? null : raw[prop].codecImplementationName;
  // output[raw[prop].mediaType][direction].codec.implementation = raw[prop].codecImplementationName || null;
  //
  // raw[prop].googCodecName = raw[prop].googCodecName === 'unknown' ? null : raw[prop].googCodecName;
  // output[raw[prop].mediaType][direction].codec.name = raw[prop].googCodecName || output[raw[prop].mediaType][direction].codec.name;
  // } else {
  //   console.log('No codec parsing');
  // }
};

export default parseCodecs;
