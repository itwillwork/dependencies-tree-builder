const PackageCollector = require('./package_collector');
const PackageCache = require('./package_cache');
const TreeFactory = require('./tree_factory');
const ScoupeFactory = require('./scoupe_factory');
const Logger = require('./logger');
const packageJson = require('package-json');

const DEFAULT_OPTIONS = {
  useCache: true,
  viewFullLogs: false,
};

const defaultLogger = new Logger();

module.exports = async (
  treeRoot,
  options = DEFAULT_OPTIONS,
  logger = defaultLogger
) => {
  logger.log('build tree for root: \n' + JSON.stringify(treeRoot, null, 4));

  logger.setStrategy(options);

  const packageCache = new PackageCache(logger);
  const packageCollector = new PackageCollector(
    packageJson,
    packageCache,
    logger
  );
  logger.log('initialized packageCollector');

  if (options.useCache) {
    packageCollector.restoreCacheInstance();
    logger.log('restored packageCollector');
  }

  const treeFactory = new TreeFactory(packageCollector, logger);
  const tree = await treeFactory.create(treeRoot);
  logger.log('builded tree: \n', JSON.stringify(tree, null, 4));

  packageCollector.saveCache();
  logger.log('saved packageCollector cache');

  const scoupeFactory = new ScoupeFactory(logger);
  const scoupe = scoupeFactory.create(tree);
  logger.log('builded scoupe: \n', JSON.stringify(scoupe, null, 4));

  return {
    tree,
    scoupe,
    packageCollector,
  };
};