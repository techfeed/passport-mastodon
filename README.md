# passport-mastodon

Passport strategy for authenticating with Mastodon using the OAuth 2.0 API.

This module lets you authenticate using Mastodon in your Node.js applications. By plugging into Passport, Mastodon authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

## Install
```
$ npm install passport-mastodon
```

## Usage

### Create an Application
Before using passport-mastodon, you must register an application with Mastodon. If you have not already done so, a new application can be created by Mastodon REST API. Your application will be issued an app ID and app secret, which need to be provided to the strategy. You will also need to configure a redirect URI which matches the route in your application.

Sample
```
$ curl -X POST -sS https://${MASTODON_HOST}/api/v1/apps \
  -F "client_name=${CLIENT_NAME}" \
  -F "redirect_uris=${CALLBACK_URL}" \
  -F "scopes=read write"
```
See: [Mastodon API overview - Apps](https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#apps)

### Configure Strategy
The Mastodom authentication strategy authenticates users using a Mastodon account and OAuth 2.0 tokens. The app ID and secret obtained when creating an application are supplied as options when creating the strategy. The strategy also requires a verify callback, which receives the access token and optional refresh token, as well as profile which contains the authenticated user's Mastodon profile. The verify callback must call cb providing a user to complete authentication.

```
passport.use(new MastodomStrategy({
    clientID: MASTODON_APP_ID,
    clientSecret: MASTODON_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/mastodon/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ exampleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

### Authenticate Requests

Use passport.authenticate(), specifying the 'oauth2' strategy, to authenticate requests.

For example, as route middleware in an Express application:

```
app.get('/auth/example',
  passport.authenticate('mastodon'));

app.get('/auth/mastodon/callback',
  passport.authenticate('mastodon', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```





