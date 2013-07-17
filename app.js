var express = require('express');
var configurations = module.exports;
var app = express();
var nconf = require('nconf');
var settings = require('./settings')(app);

nconf.argv().env().file({file: 'local.json'});

require('./routes')(app);

app.listen(nconf.get('port'), function() {
  console.log('Server listening ( http://localhost:%d )', nconf.get('port'));
});
