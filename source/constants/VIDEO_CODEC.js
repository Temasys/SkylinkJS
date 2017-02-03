/**
 * <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available video codecs to set as the preferred video codec to use to encode
 * sending video data when available encoded video codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute VIDEO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any video codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description video codec preference.
 * @param {String} VP8  <small>Value <code>"VP8"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP8">VP8</a> video codec.
 * @param {String} VP9  <small>Value <code>"VP9"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP9">VP9</a> video codec.
 * @param {String} H264 <small>Value <code>"H264"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC">H264</a> video codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264',
  VP9: 'VP9'
  //H264UC: 'H264UC'
};