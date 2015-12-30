var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.use(session({secret: 'Goojeub2'}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/proxy');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  var ClientSchema = mongoose.Schema({
    name: String,
    strategy: {
      name: String,
      data: [String]
    },
    manual: {
      url: String,
      map: {
        user: String,
        pass: String
      }
    },
    proxies: [
      {
        url: String,
        strategy: {
          name: String,
          data: [String]
        },
        manual: {
          url: String,
          path: String,
          map: {
            user: String,
            pass: String
          }
        }
      }
    ]
  });

  var Client = mongoose.model('Client', ClientSchema);

  Client.find(function(err, clients) {
    clients.forEach(function(client) {

      var router = express.Router();

      app.use('/'+client.name, router);

      client.proxies.forEach(function(proxy) {

        router.use('/'+path, function authFn(req, res, next) {

        });

        router.use('/'+path, function proxyFn(req, res, next) {
          req.pipe(request(proxy.url+req.url)).pipe(res);
        });
        
      });

    });
  });
});
