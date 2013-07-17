'use strict';

// Module dependencies.
module.exports = function (app) {
  var express = require('express');
  var path = require('path');
  var nunjucks = require('nunjucks');
  var nconf = require('nconf');
  var stylus = require('stylus');
  var nib = require('nib');
  var maxAge = 24 * 60 * 60 * 1000 * 28;

  nconf.argv().env().file({
    file: 'local.json'
  });

  // Stylus
  function compileStylus(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', !nconf.get('debug'))
      .set('force', nconf.get('debug'))
      .use(nib());
  }

  // Nunjucks
  var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader( path.join( __dirname, 'views' )));
  nunjucksEnv.express(app);

  // Configuration
  app.configure(function () {
    app.set('views', __dirname + '/views');
    app.disable('x-powered-by');
    app.use(express.bodyParser());
    if (!process.env.NODE_ENV) {
      app.use(express.logger('dev'));
    }
    app.use(function (req, res, next) {
      res.locals.session = req.session;
      res.locals.isDebug = nconf.get('debug');
      next();
    });
    app.locals.pretty = true;
    app.use(stylus.middleware({
      src: __dirname + '/public',
      compile: compileStylus
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
  });

  app.configure('development', 'test', function () {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('prod', 'test', function () {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('500', {
        error: err,
        url: null,
        layout: false,
        page: 'error'
      });
    });
  });

  app.configure('prod', function () {
    app.use(express.errorHandler());
  });

  return app;
};
