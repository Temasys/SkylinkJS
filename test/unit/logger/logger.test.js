const expect = require('chai').expect;
const jsdom = require('jsdom');
const sinon = require('sinon');

global.window = new jsdom.JSDOM('', {
  url: 'http://www.test.com/test?foo=1&bar=2&fizz=3'
}).window;

const LOG_LEVELS = {
  TRACE: 0, // All Logs
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4, // Ideal level for Production Env.
  SILENT: 5, // No logging
};

const prependSkylink = 'SkylinkJS -';

const logger = require('../../../src/logger/index').default;
const utilMethods = require('../../../src/logger/log-helpers');

describe('Skylink Logger Test Suite', () => {
  beforeEach(() => {
    sinon.spy(console, 'trace');
    sinon.spy(console, 'debug');
    sinon.spy(console, 'info');
    sinon.spy(console, 'error');
    sinon.spy(console, 'warn');
  });

  afterEach(() => {
    console.trace.restore();
    console.debug.restore();
    console.info.restore();
    console.error.restore()
    console.warn.restore();
  });

  after(() => sinon.restore());

  it('should be an object', () => {
   expect(logger).to.be.a('object');
  });

  it('should have correct log levels and their integer values', () => {
    expect(logger.levels).to.be.a('object');
    expect(logger.levels).to.deep.equal(LOG_LEVELS);
  });

  it('should set the correct logLevel when setLevel method is called', () => {
    logger.setLevel(logger.levels.TRACE);
    expect(logger.level).to.equal(logger.levels.TRACE);

    logger.setLevel(logger.levels.DEBUG);
    expect(logger.level).to.equal(logger.levels.DEBUG);

    logger.setLevel(logger.levels.INFO);
    expect(logger.level).to.equal(logger.levels.INFO);

    logger.setLevel(logger.levels.WARN);
    expect(logger.level).to.equal(logger.levels.WARN);

    logger.setLevel(logger.levels.ERROR);
    expect(logger.level).to.equal(logger.levels.ERROR);

    logger.setLevel(logger.levels.SILENT);
    expect(logger.level).to.equal(logger.levels.SILENT);
  });

  it('sets loglevel to TRACE::0 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';
    logger.setLevel(logger.levels.TRACE);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);
    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
  });

  it('sets loglevel to DEBUG::1 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.setLevel(logger.levels.DEBUG);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
  });

  it('sets loglevel to INFO::2 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.setLevel(logger.levels.INFO);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
  });

  it('sets loglevel to WARN::3 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.setLevel(logger.levels.WARN);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
  });

  it('sets loglevel to ERROR::4 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.setLevel(logger.levels.ERROR);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
  });

  it('sets loglevel to SILENT::5 and verifies the various log functions called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.setLevel(logger.levels.SILENT);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
  });

  it('should disable all logging when logger.disableAll method is called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.disableAll();
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(false);
    expect(logger.level).to.equal(logger.levels.SILENT);
  });

  it('should enable all logging when logger.enableAll method is called', () => {
    const TEST_CONSOLE_STRING = 'TEST_CONSOLE_STRING';

    logger.enableAll();
    logger.log.TRACE(TEST_CONSOLE_STRING);
    logger.log.DEBUG(TEST_CONSOLE_STRING);
    logger.log.INFO(TEST_CONSOLE_STRING);
    logger.log.WARN(TEST_CONSOLE_STRING);
    logger.log.ERROR(TEST_CONSOLE_STRING);

    expect(console.trace.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.debug.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.info.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.warn.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(console.error.calledWith(`${prependSkylink} TEST_CONSOLE_STRING`)).to.equal(true);
    expect(logger.level).to.equal(logger.levels.TRACE);
  });

  it('should set default logging level to ERROR when setLevel is called with a bad parameter', () => {
    logger.setLevel(undefined);
    expect(logger.level).to.equal(logger.levels.ERROR);
    logger.setLevel("SOME STRING");
    expect(logger.level).to.equal(logger.levels.ERROR);
  });

  it('should format the log message correctly when all message fragments are present', () => {
    const TEST_CONSOLE_STRING = ['FRAGMENT 1', 'FRAGMENT 2', 'FRAGMENT 3', 'LOGGER MESSAGE STRING'];
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING);
    expect(console.info.calledWith(`${prependSkylink} [FRAGMENT 1] <<FRAGMENT 2>> (FRAGMENT 3) LOGGER MESSAGE STRING`)).to.equal(true);
  });

  it('should format the log message correctly when only first message fragment is present', () => {
    const TEST_CONSOLE_STRING = ['FRAGMENT 1', null, null, 'LOGGER MESSAGE STRING'];
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING);
    expect(console.info.calledWith(`${prependSkylink} [FRAGMENT 1] LOGGER MESSAGE STRING`)).to.equal(true);
  });

  it('should format the log message correctly when only second message fragment is present', () => {
    const TEST_CONSOLE_STRING = [null, 'FRAGMENT 2', null, 'LOGGER MESSAGE STRING'];
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING);
    expect(console.info.calledWith(`${prependSkylink} - <<FRAGMENT 2>> LOGGER MESSAGE STRING`)).to.equal(true);
  });

  it('should format the log message correctly when only third message fragment (as a string) is present', () => {
    const TEST_CONSOLE_STRING = [null, null, 'FRAGMENT 3', 'LOGGER MESSAGE STRING'];
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING);
    expect(console.info.calledWith(`${prependSkylink} - (FRAGMENT 3) LOGGER MESSAGE STRING`)).to.equal(true);
  });

  it('should format the log message correctly when only third message fragment (as an array of strings) is present', () => {
    const TEST_CONSOLE_STRING = [null, null, ['FRAGMENT 3-0', 'FRAGMENT 3-1', 'FRAGMENT 3-2'], 'LOGGER MESSAGE STRING'];
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING);
    expect(console.info.calledWith(`${prependSkylink} - (FRAGMENT 3-0) (FRAGMENT 3-1) (FRAGMENT 3-2) LOGGER MESSAGE STRING`)).to.equal(true);
  });

  it('should format the log message correctly with debug object', () => {
    const TEST_CONSOLE_STRING = ['FRAGMENT 1', 'FRAGMENT 2', 'FRAGMENT 3', 'LOGGER MESSAGE STRING'];
    const debugObject = {
      key1: 'VALUE_1',
      key2: 'VALUE_2'
    };
    logger.setLevel(logger.levels.INFO);
    logger.log.INFO(TEST_CONSOLE_STRING, debugObject);
    expect(console.info.calledWithExactly(`${prependSkylink} [FRAGMENT 1] <<FRAGMENT 2>> (FRAGMENT 3) LOGGER MESSAGE STRING`, debugObject)).to.equal(true);
  });

  it('should not log anything if console in not available', () => {
    const TEST_CONSOLE_STRING = 'TEST STRING';
    const consoleRef = console;
    const UNDEF = undefined;
    console = UNDEF;
    logger.setLevel(logger.levels.TRACE);
    logger.log.INFO(TEST_CONSOLE_STRING);
    console = consoleRef;
    expect(console.info.calledWith(`${prependSkylink} ${TEST_CONSOLE_STRING}`)).to.equal(false);
  });

  it('should not log anything if a method of console in not available', () => {
    const TEST_CONSOLE_STRING = 'TEST STRING';
    const consoleTraceRef = console.trace;
    const UNDEF = undefined;
    console.trace = UNDEF;
    logger.setLevel(logger.levels.TRACE);
    logger.log.TRACE(TEST_CONSOLE_STRING);
    console.trace = consoleTraceRef;
    expect(console.trace.calledWith(`${prependSkylink} ${TEST_CONSOLE_STRING}`)).to.equal(false);
  });

  it('should test the persistLogLevel and getPersistedLevel methods from utils loggers', function() {
    const LEVEL_STORAGE_KEY = 'loglevel:skylinkjs';
    utilMethods.persistLogLevel(LOG_LEVELS.DEBUG);
    expect(Number(window.localStorage.getItem(LEVEL_STORAGE_KEY))).to.equal(LOG_LEVELS.DEBUG);
    utilMethods.persistLogLevel(LOG_LEVELS.TRACE);
    expect(utilMethods.getPersistedLevel(LOG_LEVELS)).to.equal(LOG_LEVELS.TRACE);
  });
});