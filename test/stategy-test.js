'use strict';

const assert = require("power-assert");
const MastodonStrategy = require('../lib/strategy');
const chai = {};
require('chai-passport-strategy')(chai);

describe('MastodonStrategy', () => {

  const strategyOpts = {
    provider: 'mastodon.social',
    domain: 'mastodon.social',
    ssl: true,
    clientID: 'ABC123',
    clientSecret: 'secret',
    callbackURL: 'http://localhost:3000/auth/mastodon',
  };

  let strategy;

  beforeEach(() => {
    strategy = new MastodonStrategy(strategyOpts, () => {});
  })

  describe('constructed', function() {
    it('should be named mastodon', function() {
      assert(strategy.name === strategyOpts.provider);
    });
  })

  describe('authorization request', () => {
    let redirect;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(r => {
          redirect = r;
          done();
        })
        .error(done)
        .authenticate();
    });

    it ('should be redirected', () => {
      const {domain, callbackURL, clientID} = strategyOpts;
      const expectedRedirect = `https://${domain}/oauth/authorize?response_type=code&redirect_uri=${encodeURIComponent(callbackURL)}&client_id=${clientID}`;
      assert(redirect === expectedRedirect);
    });
  });

  describe('userProfile', () => {

    let userProfile;
    const bodyData = {
      id: 'xxxx',
      username: 'username1',
      display_name: 'display_name1'
    };
    beforeEach(() => {
      userProfile = (token) => {
        return new Promise((resolve, reject) => {
          strategy.userProfile(token, (err, p) => {
            if (err) {return reject(err);}
            resolve(p);
          });
        });
      };
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        const body = Object.assign({url}, bodyData);
        callback(null, JSON.stringify(body), undefined);
      };
    });

    it('fetched from default endpoint', () => {
      return userProfile('token')
        .then(profile => {
          assert(profile.provider === strategyOpts.provider);
          assert(profile.id === bodyData.id);
          assert(profile.username === bodyData.username);
          assert(profile.displayName === bodyData.display_name);
          assert(profile.profileUrl === 'https://mastodon.social/api/v1/accounts/verify_credentials');
        });
    });
  });

});
