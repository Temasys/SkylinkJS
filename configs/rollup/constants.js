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

const FOLDERS = ['latest', '2.x'];

export default { BUILD_JS, FOLDERS };
