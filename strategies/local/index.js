var local = require('passport-local');
var path = require('path');
var request = require('request');
var loggedIn = require('connect-ensure-login').ensureLoggedIn;

exports = module.exports = function(passport, proxy, strategy, route, client) {

  passport.use('local-'+client+'-'+proxy.path, new local(
    function(username, password, done) {
      console.log(strategy.data.url);
      request.post(strategy.data.url, {form: {username: username, password: password}}, function(err, response, data) {
        return done(null, {id: 1, name: 'Roberto'});
        if(err) return done(err);
        if(response.statusCode < 200 || response.statusCode >= 400) return done(null, false);
        try {
          var user = JSON.parse(data);
        } catch(e) {
          return done(null, false);
        }
        console.log(user);
        done(null, user);
      });
    }
  ));

  route.get('/'+proxy.path+'/login', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'login.html'));
  });

  route.post('/'+proxy.path+'/login', passport.authenticate('local-'+client+'-'+proxy.path, { successReturnToOrRedirect: '/'+client+'/'+proxy.path, failureRedirect: '/'+client+'/'+proxy.path+'/login'}))

  route.use('/'+proxy.path, loggedIn('/'+client+'/'+proxy.path+'/login'), function localProxyFn(req, res, next) {
    req.pipe(request(proxy.url+req.url)).pipe(res);
  });


}
