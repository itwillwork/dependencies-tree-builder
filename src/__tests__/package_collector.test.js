const PackageCollector = require('../package_collector');

jest.mock('package-json');
const fakePackageJson = require('package-json');

const fakePackageData = {
  maintainers: [
    {
      name: 'shaco',
      email: 'shaco@mail.com',
    },
  ],
  'dist-tags': {
    latest: '6.1.2',
  },
  versions: {
    '1.0.0': {
      name: 'spreader',
      version: '1.0.0',
      main: './main.js',
      dependencies: {
        react: '15.4.2',
        classnames: '2.2.5',
      },
      publishConfig: {
        registry: 'https://npm.twiket.com/repository/private-node-modules/',
      },
      description: 'description',
      scripts: {
        test: 'npm run compile && jest',
        prepublish: 'npm test ',
        postpublish: 'npm run clean',
        compile: 'NODE_ENV=production webpack',
        clean: 'rimraf lib',
      },
      author: {
        name: 'shaco',
        email: 'shaco@mail.com',
      },
      license: 'ISC',
      repository: {
        type: 'git',
        url: '',
      },
      keywords: ['react'],
      homepage: '',
      readme: 'ERROR: No README data found!',
      _id: 'spreader@1.0.0',
      _shasum: '_shasum',
      _from: '.',
      _npmVersion: '3.9.3',
      _nodeVersion: '5.11.1',
      _npmUser: {
        name: 'shaco',
        email: 'shaco@mail.com',
      },
      maintainers: [
        {
          name: 'shaco',
          email: 'shaco@mail.com',
        },
      ],
      dist: {
        shasum: 'shasum',
        tarball: 'tarball',
      },
    },
    '6.1.2': {
      name: 'spreader',
      version: '6.1.2',
      main: './main.js',
      dependencies: {
        react: '16.5.0',
        classnames: '3.2.5',
      },
      publishConfig: {
        registry: 'https://npm.twiket.com/repository/private-node-modules/',
      },
      description: 'description',
      scripts: {
        test: 'npm run compile && jest',
        prepublish: 'npm test ',
        postpublish: 'npm run clean',
        compile: 'NODE_ENV=production webpack',
        clean: 'rimraf lib',
      },
      author: {
        name: 'shaco',
        email: 'shaco@mail.com',
      },
      license: 'ISC',
      repository: {
        type: 'git',
        url: '',
      },
      keywords: ['react'],
      homepage: '',
      readme: 'ERROR: No README data found!',
      _id: 'spreader@6.1.2',
      _shasum: '_shasum',
      _from: '.',
      _npmVersion: '3.9.3',
      _nodeVersion: '5.11.1',
      _npmUser: {
        name: 'shaco',
        email: 'shaco@mail.com',
      },
      maintainers: [
        {
          name: 'shaco',
          email: 'shaco@mail.com',
        },
      ],
      dist: {
        shasum: 'shasum',
        tarball: 'tarball',
      },
    },
  },
  name: 'spreader',
  _rev: '10000',
  description: 'spreader',
  readme: 'ERROR: No README data found!',
  time: {
    '1.0.0': '2017-01-31T08:52:28.551Z',
    '6.1.2': '2019-02-21T10:03:48.008Z',
  },
  _id: 'spreader',
};

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
};

jest.mock('../package_cache');
const fakePackageCache = require('../package_cache');

jest.mock('../logger');
const Logger = require('../logger');
const fakeLogger = new Logger();

beforeEach(() => {
  jest.clearAllMocks();
});

test('method packageCollector.get, regular behavior', async () => {
  // Arrange
  fakePackageJson.mockResolvedValue(fakePackageData);

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    fakePackageCache,
    fakeLogger
  );

  const result = await packageCollector.get('spreader', '1.0.0');

  // Assert
  expect(fakePackageJson).toHaveBeenCalledTimes(1);
  expect(fakePackageCache).toHaveBeenCalledTimes(0);
  expect(result).toMatchObject(fakeCacheDate['spreader']['versions']['1.0.0']);
});

test('method packageCollector.get, not found version', async () => {
  // Arrange
  fakePackageJson.mockResolvedValue(fakePackageData);

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    fakePackageCache,
    fakeLogger
  );
  const result = await packageCollector.get('spreader', '2.0.0');

  // Assert
  expect(fakePackageJson).toHaveBeenCalledTimes(1);
  expect(fakePackageCache).toHaveBeenCalledTimes(0);
  expect(result).toBe();
});

test('method packageCollector.get, should used cache', async () => {
  // Arrange

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    fakePackageCache,
    fakeLogger
  );
  await packageCollector.get('spreader', '1.0.0');
  await packageCollector.get('spreader', '6.1.2');
  await packageCollector.get('spreader', '5.1.2');

  // Assert
  expect(fakePackageJson).toHaveBeenCalledTimes(1);
  expect(fakePackageCache).toHaveBeenCalledTimes(0);
});

test('method packageCollector.restoreCache, restore cache and get any package', async () => {
  // Arrange
  const packageCache = {
    get: jest.fn().mockReturnValue(fakeCacheDate),
  };

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    packageCache,
    fakeLogger
  );
  packageCollector.restoreCacheInstance();
  const result = await packageCollector.get('spreader', '1.0.0');

  // Assert
  expect(fakePackageJson).toHaveBeenCalledTimes(0);
  expect(packageCache.get).toHaveBeenCalledTimes(1);
  expect(result).toBeTruthy();
});

test('method packageCollector.getAllVersions, regular behavior', async () => {
  // Arrange
  const shouldResult = Object.values(fakeCacheDate['spreader']['versions']);

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    fakePackageCache,
    fakeLogger
  );
  await packageCollector.get('spreader', '1.0.0');
  const result = packageCollector.getAllVersions('spreader');

  // Assert
  expect(result).toMatchObject(shouldResult);
});

test('method packageCollector.restoreCache, save cache and cache format', async () => {
  // Arrange
  const packageCache = {
    save: jest.fn(),
  };

  // Act
  const packageCollector = new PackageCollector(
    fakePackageJson,
    packageCache,
    fakeLogger
  );
  await packageCollector.get('spreader', '1.0.0');
  packageCollector.saveCache();

  // Assert
  expect(fakePackageJson).toHaveBeenCalledTimes(1);
  expect(packageCache.save).toHaveBeenCalledTimes(1);
  expect(packageCache.save).toHaveBeenCalledWith(fakeCacheDate);
});
