const ScoupeFactory = require('../scoupe_factory');

jest.mock('package-json');
const fakePackageJson = require('package-json');

const PackageCollector = require('../package_collector');

jest.mock('../logger');
const Logger = require('../logger');
const fakeLogger = new Logger();

test('scoupeFactory.create, regular behavior without deduped packages', () => {
  // Arrange
  const fakeTree = {
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
  };

  const scoupeFactory = new ScoupeFactory(fakeLogger);

  // Act
  const scoupe = scoupeFactory.create(fakeTree);

  // Assert
  expect(scoupe).toMatchObject({
    spreader: {
      '6.1.2': {
        usages: [['fakeRoot@1.0.0']],
        version: '6.1.2',
        name: 'spreader',
        tunable: true,
        dedupedUsages: [['fakeRoot@1.0.0']],
        countInstances: 1,
        carriers: ['fakeRoot@1.0.0'],
      },
    },
    react: {
      '16.5.0': {
        usages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        version: '16.5.0',
        name: 'react',
        dedupedUsages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        countInstances: 1,
        carriers: ['spreader@6.1.2'],
      },
      '15.4.2': {
        usages: [['fakeRoot@1.0.0']],
        version: '15.4.2',
        name: 'react',
        tunable: true,
        dedupedUsages: [['fakeRoot@1.0.0']],
        countInstances: 1,
        carriers: ['fakeRoot@1.0.0'],
      },
    },
    classnames: {
      '3.2.5': {
        usages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        version: '3.2.5',
        name: 'classnames',
        dedupedUsages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        countInstances: 1,
        carriers: ['fakeRoot@1.0.0', 'spreader@6.1.2'],
      },
    },
  });
});

test('scoupeFactory.create, regular behavior with deduped packages', () => {
  // Arrange
  const fakeTree = {
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
            dependencies: [
              {
                fullName: 'react@16.5.0',
                name: 'react',
                version: '16.5.0',
                usage: ['fakeRoot@1.0.0', 'spreader@6.1.2', 'classnames@3.2.5'],
                dependencies: [],
              },
            ],
          },
        ],
      },
      {
        fullName: 'react@16.5.0',
        name: 'react',
        version: '16.5.0',
        usage: ['fakeRoot@1.0.0'],
        dependencies: [],
      },
    ],
  };

  const scoupeFactory = new ScoupeFactory(fakeLogger);

  // Act
  const scoupe = scoupeFactory.create(fakeTree);

  // Assert
  expect(scoupe).toMatchObject({
    spreader: {
      '6.1.2': {
        usages: [['fakeRoot@1.0.0']],
        version: '6.1.2',
        name: 'spreader',
        tunable: true,
        dedupedUsages: [['fakeRoot@1.0.0']],
        countInstances: 1,
        main: true,
        carriers: ['fakeRoot@1.0.0'],
      },
    },
    react: {
      '16.5.0': {
        usages: [
          ['fakeRoot@1.0.0', 'spreader@6.1.2'],
          ['fakeRoot@1.0.0', 'spreader@6.1.2', 'classnames@3.2.5'],
          ['fakeRoot@1.0.0'],
        ],
        version: '16.5.0',
        name: 'react',
        tunable: true,
        dedupedUsages: [['fakeRoot@1.0.0']],
        countInstances: 1,
        main: true,
        carriers: ['fakeRoot@1.0.0'],
      },
    },
    classnames: {
      '3.2.5': {
        usages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        version: '3.2.5',
        name: 'classnames',
        dedupedUsages: [['fakeRoot@1.0.0', 'spreader@6.1.2']],
        countInstances: 1,
        main: true,
        carriers: ['fakeRoot@1.0.0', 'spreader@6.1.2'],
      },
    },
  });
});
