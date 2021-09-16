import { enterAndWelcomeHandler, CALLERS } from './commons/enterAndWelcome';

const welcomeHandler = (message) => {
  enterAndWelcomeHandler(message, CALLERS.WELCOME);
};

export default welcomeHandler;
