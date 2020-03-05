import { DemoSkylinkEventManager, SkylinkConstants } from './main.js';

/**
 * Method that logs the event to the console
 * @param {string} type - Event / Method
 * @param {string} name - name of Event / Method
 * @param {Object} detail - evt.detail / Method return value
 */
const logFormatter = (type, name, detail) => {
  console.log(`SkylinkJS - - <<${type}>> (${name})`, detail);
};

const SkylinkEvents = Object.keys(SkylinkConstants.EVENTS);

SkylinkEvents.forEach((evtName) => {
  if (SkylinkConstants.EVENTS[evtName] === SkylinkConstants.EVENTS.LOGGED_ON_CONSOLE) {
    return;
  }

  DemoSkylinkEventManager.addEventListener(SkylinkConstants.EVENTS[evtName], (evt) => {
    logFormatter("Event", SkylinkConstants.EVENTS[evtName], evt.detail);
  })
});
