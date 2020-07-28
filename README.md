# fb-editor-node

**Form Builder Editor** creates forms as configuration data for **[Form Builder Runner](https://github.com/ministryofjustice/fb-runner-node)**.

## Pre-requisites

[Node](https://nodejs.org) >= 12.4.0

## Installation

```
git clone git@github.com:ministryofjustice/fb-editor-node.git
cd fb-editor-node
npm install
```

## Usage

The `SERVICE_PATH` environment variable describes the location on your file system of the form for **Editor** to use.

To set the `SERVICE_PATH` environment variable, open a terminal and change into the root directory of **Runner**, then execute the command:

```sh
SERVICE_PATH=[path to form] npm start
```

(Where `[path to form]` is a path to the location on your file system of the form. An Example Service form can be cloned from `https://github.com/ministryofjustice/fb-example-service`.)

By default, **Editor** will start on localhost port `3000`. To run on a different port, set the `PORT` environment variable:

```sh
PORT=4321 SERVICE_PATH=[path to form] npm start
```

## Testing

```
npm test
```

### Linting

```
npm run lint
```

## Module Aliases

Some module paths are _aliased_.

At runtime they are resolved with [`@ministryofjustice/module-alias`](https://www.npmjs.com/package/@ministryofjustice/module-alias). (Its definitions can be found in the `_moduleAliases {}` field on `package.json`.)

During development aliases can be resolved in different ways according to needs of the developer's IDE. A solution we provide is via Webpack, [which is supported automatically in WebStorm and related IDEs](https://blog.jetbrains.com/webstorm/2017/06/webstorm-2017-2-eap-172-2827/), or with some [manual steps](https://stackoverflow.com/questions/34943631/path-aliases-for-imports-in-webstorm).

At start-up WebStorm will report in the *Event Log* that "Module resolution rules from `webpack.config.js` are now used for coding assistance" if the configuration is automatically identified -- if not, follow the manual steps:

1. Right-click on the `lib` directory and select `Mark Directory as > Resource root`
2. From the application menu select `Preferences > Languages & Frameworks > JavaScript > Webpack` then in the right-hand pane use the file browser to select `webpack.config.js` from the package root

You shouldn't need to restart but it won't hurt.
