const _ = require('lodash');

class PackageCollector {
  constructor(packageJson, packageCache, logger) {
    this._packageJson = packageJson;
    this._packageCache = packageCache;
    this._logger = logger;
  }

  _getCacheInstance() {
    return PackageCollector._cacheInstance;
  }

  restoreCacheInstance() {
    if (_.isEmpty(PackageCollector._cacheInstance)) {
      PackageCollector._cacheInstance = this._packageCache.get() || {};
      this._needSave = false;
    }
  }

  _preparePackageInfo(rawData) {
    const prepare = rawData =>
      _.pick(rawData, ['versions', 'name', 'version', 'dependencies']);

    rawData.versions = _.mapValues(rawData['versions'], prepare);

    return prepare(rawData);
  }

  async _getPackageInfo(name) {
    const rawData = await this._packageJson(name, { allVersions: true });

    this._logger.log('rawData', JSON.stringify(rawData, null, 4));

    return this._preparePackageInfo(rawData);
  }

  async _checkPackageInfo(name, version) {
    const cache = this._getCacheInstance();

    if (cache[name] && (!version || cache[name].versions[version])) {
      return;
    }

    this._logger.log(`fetch all info about package: ${name}`);
    cache[name] = await this._getPackageInfo(name);
    this._needSave = true;
  }

  async get(name, version) {
    this._logger.log(`get info about package: ${name}@${version}`);

    await this._checkPackageInfo(name, version);
    const cache = this._getCacheInstance();

    return cache[name].versions[version];
  }

  saveCache() {
    if (!this._needSave) {
      return;
    }
    this._logger.log('try save cache');

    const cache = this._getCacheInstance();
    this._packageCache.save(cache);
  }

  async getAllVersions(name) {
    this._logger.log(`fetch all version package: ${name}`);

    await this._checkPackageInfo(name);

    const cache = this._getCacheInstance();
    return Object.values(cache[name].versions);
  }
}

PackageCollector._cacheInstance = {};

module.exports = PackageCollector;
