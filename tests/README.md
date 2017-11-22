> **Note**: The Web SDK has switched its testing tools from [testling](https://www.npmjs.com/package/testling) and [tape](https://www.npmjs.com/package/tape) to [karma](https://www.npmjs.com/package/karma), [mocha](https://www.npmjs.com/package/mocha) and [chai](https://www.npmjs.com/package/chai).

## Running the BDD tests

### 1. Setting up the config (`test.conf.js`) file

> `config-example.js` is obsolete, please follow the format from `test.conf-example.js`. 

Setting up the `test.conf.js` is required to run the tests, since it contains the test configs, in which you would have to create your own `test.conf.js` file in the `/tests` folder.

The sample format for `test.conf.js` is provided in the `test.conf-example.js` file. Simply modify the `test.conf-example.js` file, replace with your own test setup settings, and save as `test.conf.js` file.

### 2. Running the test scripts

> There will eventually be more tests will be added more in the future.

To run the test scripts, simply run `npm test`.

The list of methods tested are listed below:

##### Method `init()` (`units/init.js`)

- [x] Tests the `init()` parameters.
- [x] Tests that the `readyStateChange` event are triggered correctly.
- [x] Tests for the missing dependencies.