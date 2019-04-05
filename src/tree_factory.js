const semver = require('semver');

class TreeFactory {
  constructor(packageCollector, logger) {
    this._packageCollector = packageCollector;
    this._logger = logger;
  }

  async create(rawNode, breadcrumbs = [], reviewedDependencies = {}) {
    if (!rawNode) {
      this._logger.log('rawNode', rawNode, breadcrumbs);
      return {};
    }
    const fullName = `${rawNode.name}@${rawNode.version}`;
    const rawNodeDependencies = Object.entries(rawNode.dependencies || {});

    const dependencies = await Promise.all(
      rawNodeDependencies.map(async ([name, version]) => {
        const fullName = `${name}@${version}`;

        if (!semver.valid(version)) {
          this._logger.log(`skip ${fullName}`);

          return `skip ${fullName}`;
        }

        if (reviewedDependencies[fullName]) {
          return `skip ${fullName}`;
        }

        const dependency = await this._packageCollector.get(name, version);

        const nextBreadcrumbs = [...breadcrumbs, fullName];

        return await this.create(dependency, nextBreadcrumbs, { 
          ...reviewedDependencies,
          [fullName]: true,
        });
      })
    );

    return {
      fullName,
      name: rawNode.name,
      version: rawNode.version,
      usage: breadcrumbs,
      dependencies,
    };
  }
}

module.exports = TreeFactory;