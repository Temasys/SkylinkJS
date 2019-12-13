import logger from '../logger/index';
import { TAGS, EVENTS } from '../constants';
import MESSAGES from '../messages';

class SkylinkEventManager {
  constructor() {
    this.events = {};
    this.privateEvents = {};
  }

  addPrivateEventListener(eventName, callback) {
    this.addListener(eventName, callback, true);
  }

  addEventListener(eventName, callback) {
    this.addListener(eventName, callback, false);
  }

  addListener(eventName, callback, isPrivate) {
    try {
      const key = isPrivate ? 'privateEvents' : 'events';

      if (!this[key][eventName]) {
        this[key][eventName] = {};
      }

      if (!this[key][eventName].callbacks) {
        this[key][eventName].callbacks = [];
      }

      this[key][eventName].callbacks.push(callback);

      if (!isPrivate) {
        logger.log.DEBUG([null, TAGS.SKYLINK_EVENT, eventName, MESSAGES.LOGGER.EVENT_REGISTERED]);
      }
    } catch (err) {
      logger.log.ERROR([null, TAGS.SKYLINK_EVENT, eventName, MESSAGES.LOGGER.EVENT_REGISTER_ERROR], err);
    }
  }

  dispatchEvent(evt) {
    if (evt.name === EVENTS.LOGGED_ON_CONSOLE) {
      return;
    }

    if (!this.events[evt.name]) {
      logger.log.DEBUG([null, TAGS.SKYLINK_EVENT, evt.name, MESSAGES.LOGGER.EVENT_DISPATCHED]);
      return;
    }

    const userCallbacks = this.events[evt.name].callbacks;
    const privateCallbacks = this.privateEvents[evt.name] ? this.privateEvents[evt.name].callbacks : [];
    const allEventCallbacks = userCallbacks.concat(privateCallbacks);
    allEventCallbacks.forEach((callback) => {
      try {
        callback(evt.detail);
      } catch (err) {
        logger.log.ERROR([null, TAGS.SKYLINK_EVENT, evt.name, MESSAGES.LOGGER.EVENT_DISPATCH_ERROR], err);
      }
    });
  }

  removeEventListener(eventName, callback) {
    this.removeListener(eventName, callback, false);
  }

  removePrivateEventListener(eventName, callback) {
    this.removeListener(eventName, callback, true);
  }

  removeListener(eventName, callback, isPrivate) {
    const key = isPrivate ? 'privateEvents' : 'events';

    if (!isPrivate && !(this.events[eventName] && this.events[eventName].callbacks)) {
      logger.log.WARN([null, TAGS.SKYLINK_EVENT, eventName, MESSAGES.LOGGER.EVENT_UNREGISTERED]);
      return;
    }

    try {
      this[key][eventName].callbacks.forEach((cb, i) => {
        if (cb === callback) {
          delete this[key][eventName].callbacks[i];

          if (!isPrivate) {
            logger.log.DEBUG([null, TAGS.SKYLINK_EVENT, eventName, MESSAGES.LOGGER.EVENT_UNREGISTERED]);
          }
        }
      });
    } catch (err) {
      logger.log.ERROR([null, TAGS.SKYLINK_EVENT, eventName, MESSAGES.LOGGER.EVENT_DISPATCH_ERROR], err);
    }
  }
}

const skylinkEventManager = new SkylinkEventManager();
const addEventListener = skylinkEventManager.addPrivateEventListener.bind(skylinkEventManager);
const removeEventListener = skylinkEventManager.removePrivateEventListener.bind(skylinkEventManager);
const dispatchEvent = skylinkEventManager.dispatchEvent.bind(skylinkEventManager);

export default skylinkEventManager;
export { addEventListener, removeEventListener, dispatchEvent };
