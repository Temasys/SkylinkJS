/* eslint-disable import/no-extraneous-dependencies */
import localResolve from 'rollup-plugin-local-resolve';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import externalGlobals from 'rollup-plugin-external-globals';
import del from 'rollup-plugin-delete';
import replace from '@rollup/plugin-replace';
import paths from '../paths';
import pkg from '../../package.json';
import CONSTANTS from './constants';

const globals = { 'socket.io-client': 'io' };
const external = ['socket.io-client'];
const WRTC_AJS_DEST_PATH = `${paths.appNodeModules}/webrtc-adapter/out/adapter.js`;
const BUILD_PATH = paths.appBuild;
const banner = `/* SkylinkJS v${pkg.version} ${new Date().toString()} */`;
// eslint-disable-next-line prefer-destructuring
const BUILD_JS = CONSTANTS.BUILD_JS;

const config = {
  input: paths.appIndexJs,
  output: [
    {
      file: `${BUILD_PATH}/${BUILD_JS.esm.fileName}`,
      format: BUILD_JS.esm.format,
      exports: 'named',
      globals,
      banner,
    },
    {
      file: `${BUILD_PATH}/${BUILD_JS.esm.minFileName}`,
      format: BUILD_JS.esm.format,
      exports: 'named',
      globals,
      banner,
    },
    {
      file: `${BUILD_PATH}/${BUILD_JS.umd.fileName}`,
      format: BUILD_JS.umd.format,
      exports: 'named',
      name: 'Skylink',
      globals,
      banner,
    },
    {
      file: `${BUILD_PATH}/${BUILD_JS.umd.minFileName}`,
      format: BUILD_JS.umd.format,
      exports: 'named',
      name: 'Skylink',
      globals,
      banner,
    },
  ],
  onwarn: (warning, warn) => {
    // skip certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // Use default for everything else
    warn(warning);
  },
  plugins: [
    replace({
      __sdkVersion__: JSON.stringify(pkg.version),
    }),
    resolve({
      only: ['webrtc-adapter', 'clone', 'crypto-js', 'sdp', 'rtcpeerconnection-shim'],
    }),
    commonJS({
      namedExports: {
        [WRTC_AJS_DEST_PATH]: ['AdapterJS'],
      },
    }),
    terser({
      include: [/^.+\.min\.umd\.js$/, /^.+\.min\.js$/],
      exclude: ['some*'],
      compress: {
        arguments: true,
      },
      mangle: {
        eval: true,
      },
    }),
    externalGlobals(globals),
    localResolve(),
    del({
      targets: `${BUILD_PATH}`,
      verbose: true,
    }),
  ],
  external,
};

export default [config];
