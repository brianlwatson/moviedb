const passport = require('passport');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    }, (username, password, done) => {
      const url = 'mongodb://localhost:27017';
      const dbName = 'movieDB';
      (async function mongo() {
        let client;

        try {
          client = await MongoClient.connect(url);

          debug('Connected correctly to server');

          const db = client.db(dbName);
          const col = db.collection('users');

          const user = await col.findOne({ username });
          if (user === null) {
            debug('User not found!');
            done(null, false);
          }
          else if (user.password === password) {
            debug('Welcome!', user);
            done(null, user);
          } else {
            debug('Incorrect Password!');
            done(null, false);
          }
        } catch (err) {
          console.log(err.stack);
        }
        // Close connection
        client.close();
      }());
    }));
};
