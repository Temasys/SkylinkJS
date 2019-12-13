import localResolve from 'rollup-plugin-local-resolve';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import externalGlobals from 'rollup-plugin-external-globals';
import gzipPlugin from 'rollup-plugin-gzip';
import del from 'rollup-plugin-delete';
import paths from '../paths';
import pkg from '../../package.json';

const globals = { 'socket.io-client': 'io' };
const external = ['socket.io-client'];
const AJS_DEST_PATH = `${paths.appNodeModules}/adapterjs/publish/adapter.min.js`;
const DIST_PATH = paths.appDist;
const banner = `/* SkylinkJS v${pkg.version} ${new Date().toString()} */`;
const BUILD_JS = {
  iife: {
    format: 'iife',
    fileName: 'skylink.browser.js',
    minFileName: 'skylink.min.browser.js',
  },
  esm: {
    format: 'esm',
    fileName: 'skylink.complete.js',
    minFileName: 'skylink.complete.min.js',
  },
  cjs: {
    format: 'cjs',
    fileName: 'skylink.cjs.js',
    minFileName: 'skylink.min.cjs.js',
  },
  umd: {
    format: 'umd',
    fileName: 'skylink.umd.js',
    minFileName: 'skylink.min.umd.js',
  },
};

export default [{
  input: paths.appIndexJs,
  output: [
    {
      file: `${DIST_PATH}/${BUILD_JS.esm.fileName}`,
      format: BUILD_JS.esm.format,
      exports: 'named',
      globals,
      banner,
    }, {
      file: `${DIST_PATH}/${BUILD_JS.esm.minFileName}`,
      format: BUILD_JS.esm.format,
      exports: 'named',
      globals,
      banner,
    },
    // {
    //   file: `${DIST_PATH}/${BUILD_JS.iife.fileName}`,
    //   format: BUILD_JS.iife.format,
    //   name: 'Skylink',
    //   exports: 'named',
    //   globals,
    //   banner,
    // },
    // {
    //   file: `${DIST_PATH}/${BUILD_JS.iife.minFileName}`,
    //   format: BUILD_JS.iife.format,
    //   name: 'Skylink',
    //   exports: 'named',
    //   globals,
    //   banner,
    // },
    // {
    //   file: `${DIST_PATH}/${BUILD_JS.cjs.fileName}`,
    //   format: BUILD_JS.cjs.format,
    //   exports: 'named',
    //   globals,
    //   banner,
    // },
    // {
    //   file: `${DIST_PATH}/${BUILD_JS.cjs.minFileName}`,
    //   format: BUILD_JS.cjs.format,
    //   exports: 'named',
    //   globals,
    //   banner,
    // },
    // {
    //   file: `${DIST_PATH}/${BUILD_JS.umd.fileName}`,
    //   format: BUILD_JS.umd.format,
    //   name: 'Skylink',
    //   exports: 'named',
    //   globals,
    //   banner,
    // }, {
    //   file: `${DIST_PATH}/${BUILD_JS.umd.minFileName}`,
    //   format: BUILD_JS.umd.format,
    //   name: 'Skylink',
    //   exports: 'named',
    //   globals,
    //   banner,
    // },
  ],
  onwarn: (warning, warn) => {
    // skip certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // Use default for everything else
    warn(warning);
  },
  plugins: [
    resolve({
      only: ['adapterjs', 'clone'],
    }),
    commonJS({
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        [AJS_DEST_PATH]: ['AdapterJS'],
      },
    }),
    gzipPlugin(),
    terser({
      include: ['*min*'],
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
      targets: 'dist',
      verbose: true,
    }),
  ],
  external,
}];
