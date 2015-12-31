var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(session({secret: 'Goojeub2'}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/bower_components', express.static('./bower_components'));

mongoose.connect('mongodb://localhost/proxy');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  var ClientSchema = mongoose.Schema({
    name: String,
    strategy: {
      name: String,
      data: {}
    },
    proxies: [
      {
        url: String,
        path: String,
        strategy: {
          name: String,
          data: {}
        }
      }
    ]
  });

  var UserSchema = mongoose.Schema({
    user: String,
    pass: String,
    admin: {type: Boolean, default: false},
    clients: [{type: mongoose.Schema.ObjectId, ref: 'client'}]
  });

  var Client = mongoose.model('client', ClientSchema);

  var User = mongoose.model('user', UserSchema);

  Client.find(function(err, clients) {
    clients.forEach(function(client) {

      var router = express.Router();

      app.use('/'+client.name, router);

      client.proxies.forEach(function(proxy) {

        if(proxy.strategy) {
          require('./strategies/'+proxy.strategy.name)(passport, proxy, proxy.strategy, router, client.name);
        } else {
          require('./strategies/'+client.strategy.name)(passport, proxy, client.strategy, router, client.name);
        }

      });

    });
  });


});

app.listen(3000);
