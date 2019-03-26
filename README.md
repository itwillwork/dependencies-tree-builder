# dependencies-tree-builder

A package that creates a dependency tree in a future webpack bundle only by package.json.

## How to use

For example, you have `package.json`:
```
{
  "name": "demo-project",
  "version": "1.0.0",
  "dependencies": {
    "@nivo/bar": "0.54.0",
    "@nivo/core": "0.53.0",
    "@nivo/pie": "0.54.0",
    "@nivo/stream": "0.54.0"
  }
}
```
Use this package:
```javascript

const buildTreeAsync = require('dependencies-tree-builder');
const packageJson = require('./package.json');

const { 
  tree, 
  scoupe, 
  packageCollector, 
} = await buildTreeAsync(packageJson);
```
**tree** - full dependencies tree. 
In the example above:
```
{
    "fullName": "demo-project@1.0.0",
    "name": "demo-project",
    "version": "1.0.0",
    "usage": [],
    "dependencies": [
        {
            "fullName": "@nivo/bar@0.54.0",
            "name": "@nivo/bar",
            "version": "0.54.0",
            "usage": [
                "demo-project@1.0.0"
            ],
            "dependencies": [
                {
                    "fullName": "@nivo/axes@0.54.0",
                    "name": "@nivo/axes",
                    "version": "0.54.0",
                    "usage": [
                        "demo-project@1.0.0",
                        "@nivo/bar@0.54.0"
                    ],
                    "dependencies": [
                        {
                            "fullName": "@nivo/core@0.54.0",
                            "name": "@nivo/core",
                            "version": "0.54.0",
                            "usage": [
                                "demo-project@1.0.0",
                                "@nivo/bar@0.54.0",
                                "@nivo/axes@0.54.0"
                            ],
                            "dependencies": [
               ...
}
```
**scoupe** - aggregated tree by package name and version.
In the example above:
```
{
    "@nivo/bar": {
        "0.54.0": {
            "usages": [
                [
                    "demo-project@1.0.0"
                ]
            ],
            "version": "0.54.0",
            "name": "@nivo/bar",
            "tunable": true,
            "dedupedUsages": [
                [
                    "demo-project@1.0.0"
                ]
            ],
            "countInstances": 1,
            "carriers": [
                "demo-project@1.0.0"
            ],
            "popular": true,
            "main": true
        }
    },
    "@nivo/axes": {
        "0.54.0": {
            "usages": [
                [
                    "demo-project@1.0.0",
                    "@nivo/bar@0.54.0"
                ]
       ...
}
```

**packageCollector** - wrap [package-json](https://www.npmjs.com/package/package-json) package with cache, has methods:
* packageCollector.get(name, version) - return package.json for name@version package
* packageCollector.getAllVersions(name) - return all versions of package

### Installation
```
npm i --save dependencies-tree-builder
```
## Contributing
Got ideas on how to make this better? Open an issue!

## License
MIT

