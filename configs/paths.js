const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
const paths = {
  appBuild: resolveApp('build'),
  appPublish: resolveApp('publish'),
  appDemos: resolveApp('demos'),
  appDocs: resolveApp('docs'),
  appPublic: resolveApp('public'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
};

export default paths;
