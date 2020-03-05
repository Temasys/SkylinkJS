import { isAFunction } from '../../utils/helpers';

const getOutputSources = (sources) => {
  const outputSources = {
    audio: {
      input: [],
      output: [],
    },
    video: {
      input: [],
    },
  };

  sources.forEach((sourceItem) => {
    const item = {
      deviceId: sourceItem.deviceId || sourceItem.sourceId || 'default',
      label: sourceItem.label,
      groupId: sourceItem.groupId || null,
    };

    item.label = item.label || `Source for ${item.deviceId}`;

    if (['audio', 'audioinput'].indexOf(sourceItem.kind) > -1) {
      outputSources.audio.input.push(item);
    } else if (['video', 'videoinput'].indexOf(sourceItem.kind) > -1) {
      outputSources.video.input.push(item);
    } else if (sourceItem.kind === 'audiooutput') {
      outputSources.audio.output.push(item);
    }
  });

  return outputSources;
};

/**
 * Function that returns the camera and microphone sources.
 * @return {Promise}
 * @return {Object} outputSources
 * @return {Object} outputSources.audio The list of audio input (microphone) and output (speakers) sources.
 * @return {Array} outputSources.audio.input The list of audio input (microphone) sources.
 * @return {Object} outputSources.audio.input.#index The audio input source item.
 * @return {String} outputSources.audio.input.#index.deviceId The audio input source item device ID.
 * @return {String} outputSources.audio.input.#index.label The audio input source item device label name.
 * @return {String} [outputSources.audio.input.#index.groupId] The audio input source item device physical device ID.
 * <small>Note that there can be different <code>deviceId</code> due to differing sources but can share a
 * <code>groupId</code> because it's the same device.</small>
 * @return {Array} outputSources.audio.output The list of audio output (speakers) sources.
 * @return {Object} outputSources.audio.output.#index The audio output source item.
 * <small>Object signature matches <code>outputSources.audio.input.#index</code> format.</small>
 * @return {Object} outputSources.video The list of video input (camera) sources.
 * @return {Array} outputSources.video.input The list of video input (camera) sources.
 * @return {Object} outputSources.video.input.#index The video input source item.
 * <small>Object signature matches <code>callback.success.audio.input.#index</code> format.</small>
 * @memberOf MediaStreamHelpers
 */
const getStreamSources = () => {
  const { navigator } = window;

  return new Promise((resolve, reject) => {
    if (navigator.mediaDevices && isAFunction(navigator.mediaDevices.enumerateDevices)) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          resolve(getOutputSources(devices));
        });
    } else {
      reject(getOutputSources([]));
    }
  });
};

export default getStreamSources;
