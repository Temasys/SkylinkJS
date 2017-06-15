/**
 * Contains the enums.
 * @class Constants
 * @since 0.7.0
 * @typedef module
 */
var Constants = {

  Stream: {
    /**
     * The enum of `Stream` states.
     * @attribute Stream.STATE
     * @param {String} ACTIVE The state when stream is active.
     * @param {String} ENDED The state when stream has ended.
     * @param {String} FALLBACK The state when one track is not available when both audio and video track is requested.
     * @param {String} ERROR The state when stream failed to start.
     * @type JSON
     * @final
     * @static
     * @for Constants
     * @since 0.7.0
     */
    STATE: {
      ACTIVE: 'active',
      ENDED: 'ended',
      FALLBACK: 'fallback',
      ERROR: 'error'
    },

    /**
     * The enum of `Stream` screensharing sources.
     * @attribute Stream.SCREENSHARING_SOURCES
     * @param {String} SCREEN Shares the desktop screen.
     * @param {String} WINDOW Shares the application window.
     * @param {String} TAB Shares the browser tab.
     * @param {String} CAMERA Shares the camera.
     * @param {String} APPLICATION Shares the applications.
     * @param {String} BROWSER Shares the browser.
     * @type JSON
     * @final
     * @static
     * @for Constants
     * @since 0.7.0
     */
    SCREENSHARING_SOURCES: {
      SCREEN: 'screen',
      WINDOW: 'window',
      TAB: 'tab',
      CAMERA: 'camera',
      APPLICATION: 'application',
      BROWSER: 'browser'
    },

    /**
     * The enum of `Stream` environment facing mode.
     * @attribute Stream.FACING_MODE
     * @param {String} USER The source is facing toward the user (a self-view camera).
     * @param {String} ENVIRONMENT The source is facing away from the user (viewing the environment).
     * @param {String} LEFT The source is facing to the left of the user.
     * @param {String} RIGHT The source is facing to the right of the user.
     * @type JSON
     * @final
     * @static
     * @for Constants
     * @since 0.7.0
     */
    FACING_MODE: {
      USER: 'user',
      ENVIRONMENT: 'environment',
      LEFT: 'left',
      RIGHT: 'right'
    }
  },

  StreamTrack: {
    /**
     * The enum of `StreamTrack` track types.
     * @attribute StreamTrack.TYPE
     * @param {String} AUDIO The type is audio track.
     * @param {String} VIDEO The type is video track.
     * @type JSON
     * @final
     * @static
     * @for Constants
     * @since 0.7.0
     */
    TYPE: {
      AUDIO: 'audio',
      VIDEO: 'video'
    }
  }
};