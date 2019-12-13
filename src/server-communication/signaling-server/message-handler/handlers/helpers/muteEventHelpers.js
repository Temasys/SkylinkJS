import dispatchMediaStateChangeEvents from './dispatchMediaStateChangeEvents';
import shouldDropMessage from './shouldDropMessage';

const muteEventHelpers = {
  dispatchMuteEvents: dispatchMediaStateChangeEvents,
  shouldDropMessage,
};

export default muteEventHelpers;
