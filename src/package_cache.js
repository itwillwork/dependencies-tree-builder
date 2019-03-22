const fs = require('fs');

const CACHE_FILE = 'packages.cache.json';

class PackageCache {
  constructor(logger) {
    this._logger = logger;
  }

  get() {
    this._logger.log('try find cache file');

    const hasCache = fs.existsSync(CACHE_FILE);

    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE));
    } catch (error) {
      this._logger.warn('parse error cache file', error);
    }
  }

  save(data) {
    this._logger.log('try save cache data');

    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 4));
    } catch (error) {
      this._logger.warn('error save cache file', error);
    }
  }
}

module.exports = PackageCache;
