#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  Packages = require('./packages');

// If link is passed we should symlink the local-packages.json
// or the individual package that was passed.
var link = _.contains(argv._, 'link');

// The last parameter can be an individual package to copy or link.
var packageName = argv._[1] || !link && argv._[0];

var packageDefinitionFile = process.cwd() + '/' +
  (link ? 'local-packages.json' : 'git-packages.json');

Packages.fromFile(packageDefinitionFile, function (error, packages) {
  // Fail gracefully.
  if (error) return console.log('Unable to load ' + packageDefinitionFile + 'error ' + error);

  var done = _.after(2, function () {
    process.exit();
  });

  // Only copy or link the specified package.
  if (packageName) {
    if (!packages[packageName])
      return console.log(packageName + ' was not defined in ' + packageDefinitionFile);

    packages = _.pick(packages, packageName, 'token');
  }

  Packages.ensureGitIgnore(packages, done);

  if (link) Packages.link(packages, done);
  else Packages.load(packages, done);
});
