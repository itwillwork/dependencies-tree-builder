const semver = require('semver');

class TreeFactory {
  constructor(packageCollector, logger, maxDepth) {
    this._packageCollector = packageCollector;
    this._logger = logger;
    this._maxDepth = maxDepth;
  }

  async create(rawNode, breadcrumbs = [], depth = new Map()) {
    if (!rawNode) {
      this._logger.log('rawNode', rawNode, breadcrumbs);
      return {};
    }
    const fullName = `${rawNode.name}@${rawNode.version}`;
    const rawNodeDependencies = Object.entries(rawNode.dependencies || {});

    const dependencies = await Promise.all(
      rawNodeDependencies.map(async ([name, version]) => {
        const dependency_name = `${name}@${version}`;

        if (!semver.valid(version)) {
          this._logger.log(`skip ${dependency_name}`);

          return `skip ${dependency_name}`;
        }

        const name_depth = `${fullName} -> ${dependency_name}`;
        const current_depth = depth.get(name_depth);
        if (current_depth) { depth.set(name_depth, current_depth + 1); } else { depth.set(name_depth, 1); }
        if (current_depth > this._maxDepth) return `skip ${dependency_name}`;

        const dependency = await this._packageCollector.get(name, version);

        const nextBreadcrumbs = [...breadcrumbs, fullName];

        return await this.create(dependency, nextBreadcrumbs, depth);
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
