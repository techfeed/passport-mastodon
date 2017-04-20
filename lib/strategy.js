'use strict';

const OAuth2Strategy = require('passport-oauth2')

class MastodonStrategy extends OAuth2Strategy {

  constructor(options, verify) {
    const {domain} = options;
    options = Object.assign({
      authorizationURL: `https://${domain}/oauth/authorize`,
      tokenURL: `https://${domain}/oauth/token`,
      scopeSeparator: ' ',
    }, options);
    super(options, verify);

    this.name = options.provider || 'mastodon';

    this._profileURL = options.profileURL || `https://${domain}/api/v1/accounts/verify_credentials`;
  }

  authenticate(req, options) {
    if (req.body && req.body.error) {
      return this.error(new Error(req.body.error));
    }
    super.authenticate(req, options);
  }

  /**
   * Get user profile
   */
  userProfile(accessToken, done) {
    this._oauthGet(this._profileURL, accessToken)
      .then(({body, res}) => {
        const json = JSON.parse(body);
        return {
          provider: this.name,
          id: json.id,
          username: json.username,
          displayName: json.display_name,
          profileUrl: json.url,
          _raw: body,
          _json: json,
        };
      })
      .then((profile) => done(null, profile))
      .catch(done);
  }

  /**
   * oauth get to Promise
   */
  _oauthGet(url, accessToken, cb) {
    return new Promise((resolve, reject) => {
      this._oauth2.get(this._profileURL, accessToken, function (err, body, res) {
        if (err) {return reject(err);}
        resolve({body, res});
      });
    })
  }


}

module.exports = MastodonStrategy;
