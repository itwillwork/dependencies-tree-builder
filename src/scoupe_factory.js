const _ = require('lodash');

const byLengthAsc = (a, b) => a.length - b.length;
const semver = require('semver');

class ScoupeFactory {
  constructor(logger) {
    this._logger = logger;
  }

  _flatTree(scoupe, tree, tunable = false) {
    const treeDependencies = tree.dependencies || [];

    treeDependencies.forEach(dependency => {
      if (typeof dependency === 'string') {
        return;
      }

      const { name, version, usage, dependencies } = dependency;

      if (!scoupe[name]) {
        scoupe[name] = {};
      }

      if (!scoupe[name][version]) {
        scoupe[name][version] = {
          usages: [],
          version,
          name,
        };
      }

      if (tunable) {
        scoupe[name][version].tunable = true;
      }

      scoupe[name][version].usages.push(usage);

      this._flatTree(scoupe, dependency);
    });
  }

  _dedupeUsages(scoupe) {
    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);
      const hasOnlyOneVersion = allVersions.length === 1;

      allVersions.forEach(data => {
        const { usages, tunable } = data;

        const carriers = {};

        const sortedUsages = [...usages].sort(byLengthAsc);
        const dedupedUsages = sortedUsages.filter(usage => {
          let startUsagePath = 1;

          if (hasOnlyOneVersion || tunable) {
            startUsagePath = 0;
          }

          const effectiveUsage = usage.slice(startUsagePath);
          const isDeduped = effectiveUsage.some(path => carriers[path]);

          if (!isDeduped) {
            effectiveUsage.forEach(path => {
              carriers[path] = true;
            });
          }

          return !isDeduped;
        });

        data.dedupedUsages = dedupedUsages;
        data.countInstances = dedupedUsages.length;
        data.carriers = Object.keys(carriers);
      });
    });
  }

  _markMainVersions(scoupe) {
    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);

      const tunableVersion = _.find(allVersions, ['tunable', true]);

      const popularVersion = allVersions.reduce(
        (popularVersion, dependency) => {
          if (dependency.usages.length > popularVersion.usages.length) {
            return dependency;
          }

          // TODO еще раз проработать возможно тут бага
          if (
            dependency.usages.length === popularVersion.usages.length &&
            semver.lt(popularVersion.version, dependency.version)
          ) {
            return dependency;
          }

          return popularVersion;
        },
        { usages: [] }
      );

      popularVersion.popular = true;

      const mainVersion = tunableVersion || popularVersion;

      mainVersion.main = true;
    });
  }

  create(tree) {
    const scoupe = {};

    this._flatTree(scoupe, tree, true);
    this._dedupeUsages(scoupe);
    this._markMainVersions(scoupe);

    return scoupe;
  }
}

module.exports = ScoupeFactory;
