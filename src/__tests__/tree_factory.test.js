const TreeFactory = require('../tree_factory');

jest.mock('package-json');
const fakePackageJson = require('package-json');

const PackageCollector = require('../package_collector');

jest.mock('../logger');
const Logger = require('../logger');
const fakeLogger = new Logger();

const fakeCacheDate = {
  spreader: {
    versions: {
      '1.0.0': {
        name: 'spreader',
        version: '1.0.0',
        dependencies: {
          react: '15.4.2',
          classnames: '2.2.5',
        },
      },
      '6.1.2': {
        name: 'spreader',
        version: '6.1.2',
        dependencies: {
          react: '16.5.0',
          classnames: '3.2.5',
        },
      },
    },
    name: 'spreader',
  },
  react: {
    versions: {
      '15.4.2': {
        name: 'react',
        version: '15.4.2',
      },
      '16.5.0': {
        name: 'react',
        version: '16.5.0',
      },
    },
    name: 'react',
  },
  classnames: {
    versions: {
      '2.2.5': {
        name: 'classnames',
        version: '2.2.5',
      },
      '3.2.5': {
        name: 'classnames',
        version: '3.2.5',
      },
    },
    name: 'classnames',
  },
};

test('method treeFactory.create, exact versions', async () => {
  // Arrange
  const fakeRootTree = {
    name: 'fakeRoot',
    version: '1.0.0',
    dependencies: {
      spreader: '6.1.2',
      react: '15.4.2',
    },
  };

  const packageCache = {
    get: jest.fn().mockReturnValue(fakeCacheDate),
  };

  const packageCollector = new PackageCollector(
    fakePackageJson,
    packageCache,
    fakeLogger
  );
  const treeFactory = new TreeFactory(packageCollector, fakeLogger);

  // Act
  packageCollector.restoreCacheInstance();
  const result = await treeFactory.create(fakeRootTree);

  // Assert
  expect(result).toMatchObject({
    fullName: 'fakeRoot@1.0.0',
    name: 'fakeRoot',
    version: '1.0.0',
    usage: [],
    dependencies: [
      {
        fullName: 'spreader@6.1.2',
        name: 'spreader',
        version: '6.1.2',
        usage: ['fakeRoot@1.0.0'],
        dependencies: [
          {
            fullName: 'react@16.5.0',
            name: 'react',
            version: '16.5.0',
            usage: ['fakeRoot@1.0.0', 'spreader@6.1.2'],
            dependencies: [],
          },
          {
            fullName: 'classnames@3.2.5',
            name: 'classnames',
            version: '3.2.5',
            usage: ['fakeRoot@1.0.0', 'spreader@6.1.2'],
            dependencies: [],
          },
        ],
      },
      {
        fullName: 'react@15.4.2',
        name: 'react',
        version: '15.4.2',
        usage: ['fakeRoot@1.0.0'],
        dependencies: [],
      },
    ],
  });
});
