/* eslint-disable import/no-extraneous-dependencies */
import gzipPlugin from 'rollup-plugin-gzip';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import PATHS from '../paths';
import CONSTANTS from './constants';
import pkg from '../../package.json';

const BUILD_PATH = PATHS.appBuild;
const PUBLISH_PATH = PATHS.appPublish;
const DOCS_PATH = PATHS.appDocs;
const COLLECTION_DEMOS_PATH = `${PATHS.appDemos}/collection`;
const DEMOS = ['audio-call', 'chat', 'kitchensink', 'video-call'];
const replaceImportSrc = contents => contents.toString().replace('../../../build/skylink.complete.js', '../../../skylink.complete.js');

const CONFIGS = [];
const getOptions = (folderName, file) => ({
  minify: {
    include: [/^.+\.min\.js$/],
    exclude: ['some*'],
    compress: {
      arguments: true,
    },
    mangle: {
      eval: true,
    },
  },
  gzip: {
    fileName: () => `${PUBLISH_PATH}/${folderName}/gzip/${file}`,
  },
  copy: {
    targets: [
      { src: DOCS_PATH, dest: `${PUBLISH_PATH}/${folderName}` },
      { src: COLLECTION_DEMOS_PATH, dest: `${PUBLISH_PATH}/${folderName}/demos` },
      { src: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[0]}/main.js`, dest: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[0]}`, transform: replaceImportSrc },
      { src: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[1]}/main.js`, dest: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[1]}`, transform: replaceImportSrc },
      { src: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[2]}/main.js`, dest: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[2]}`, transform: replaceImportSrc },
      { src: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[3]}/main.js`, dest: `${PUBLISH_PATH}/${folderName}/demos/collection/${DEMOS[3]}`, transform: replaceImportSrc },
    ],
  },
});

const generateConfig = (options) => {
  CONSTANTS.FOLDERS.push(pkg.version);
  CONSTANTS.FOLDERS.forEach((folderName) => {
    for (let i = 0; i < options.length; i += 1) {
      const file = options[i].fileName;
      const OPTIONS = getOptions(folderName, file);
      const config = {
        input: `${BUILD_PATH}/${file}`,
        output: [
          {
            file: `${PUBLISH_PATH}/${folderName}/${file}`,
            format: options[i].format,
          },
        ],
        plugins: [
          //terser(OPTIONS.minify),
          gzipPlugin(OPTIONS.gzip),
          copy(OPTIONS.copy),
        ],
      };
      CONFIGS.push(config);
    }
  });

  CONFIGS[0].plugins.push(del({
    targets: `${PUBLISH_PATH}`,
    verbose: true,
  }));
};

generateConfig([
  { fileName: CONSTANTS.BUILD_JS.esm.fileName, format: CONSTANTS.BUILD_JS.esm.format },
  { fileName: CONSTANTS.BUILD_JS.esm.minFileName, format: CONSTANTS.BUILD_JS.esm.format },
  { fileName: CONSTANTS.BUILD_JS.umd.fileName, format: CONSTANTS.BUILD_JS.umd.format },
  { fileName: CONSTANTS.BUILD_JS.umd.minFileName, format: CONSTANTS.BUILD_JS.umd.format },
]);

export default CONFIGS;
