/* eslint-disable */
import gzipPlugin from 'rollup-plugin-gzip';
import PATHS from '../paths';
import CONSTANTS from './constants';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import pkg from '../../package.json';
import { terser } from 'rollup-plugin-terser';

const BUILD_PATH = PATHS.appBuild;
const PUBLISH_PATH = PATHS.appPublish;
const DOCS_PATH = PATHS.appDocs;
const DEMOS_PATH = `${PATHS.appDemos}/kitchensink`;
const BANNER = `/* SkylinkJS v${pkg.version} ${new Date().toString()} */`;

const CONFIGS = [];
const getOptions = (folderName, file) => {
  return {
    minify: {
      include: ['*min*'],
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
        { src: DOCS_PATH, dest: `${PUBLISH_PATH}/${folderName}`},
        { src: DEMOS_PATH, dest: `${PUBLISH_PATH}/${folderName}/demos`},
      ]
    }
  };
};

const generateConfig = (files) => {
  CONSTANTS.FOLDERS.push(pkg.version);
  CONSTANTS.FOLDERS.forEach((folderName) => {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
    const OPTIONS = getOptions(folderName, file);
    const config = {
        input: `${BUILD_PATH}/${file}`,
        output: [
          {
            file: `${PUBLISH_PATH}/${folderName}/${file}`,
            format: CONSTANTS.BUILD_JS.esm.format,
          }
        ],
        plugins: [
          terser(OPTIONS.minify),
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
    }))
};

generateConfig([CONSTANTS.BUILD_JS.esm.fileName, CONSTANTS.BUILD_JS.esm.minFileName]);

export default CONFIGS;
