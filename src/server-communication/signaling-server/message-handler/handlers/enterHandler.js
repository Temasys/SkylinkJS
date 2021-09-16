import { enterAndWelcomeHandler, CALLERS } from './commons/enterAndWelcome';

const enterHandler = (message) => {
  enterAndWelcomeHandler(message, CALLERS.ENTER);
};

export default enterHandler;
