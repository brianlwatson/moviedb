const express = require('express');
const mongoClient = require('mongodb');
const debug = require('debug')('app:userRoutes');
const movieService = require('../services/tmdbService');
const request = require('request');
const passport = require('passport');

const apiKey = 'c9f43165fad7ad8c941c8fab3928b4fc';


const userRouter = express.Router();
let movies;

function router() {
  userRouter.route('/')
    .get((req, res) => {
      let userName;
      if (req.user) {
        userName = req.user.username;
      } else {
        userName = '';
      }
      debug(req.user);
      try {
        if (req.user) {
          res.render(
            'userView',
            {
              userName,
            },
          );
        } else {
          debug('Must be logged in to submit rating');
          const string = encodeURIComponent('loginFailure');
          res.redirect(`/?valid=${string}`);
        }
      } catch (err) {
        debug(err);
      }
    });


  userRouter.route('/signup')
    .get((req, res) => {
      const userName = '';
      try {
        res.render(
          'signupView',
          {
            userName,
          },
        );
      } catch (err) {
        debug(err);
      }
    });

  userRouter.route('/signin')
    .get((req, res) => {
      const userName = '';
      res.render(
        'signinView',
        {
          userName,
        },
      );
    })
    .post(passport.authenticate('local', {
      successRedirect: '/user/profile',
      failureRedirect: '/?valid=invalidLogin',
    }));

  userRouter.route('/signout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  userRouter.route('/signup/submit')
    .post((req, res) => {
      const { username, password } = req.body;
      const url = 'mongodb://localhost:27017';
      const dbName = 'movieDB';

      (async function addUser() {
        let client;
        try {
          client = await mongoClient.connect(url);
          debug('Connected correctly to server');

          const db = client.db(dbName);

          const col = db.collection('users');
          const user = { username, password };
          const results = await col.insertOne(user);
          debug(results);
          req.login(results.ops[0], () => {
            res.redirect('/movies');
          });
        } catch (err) {
          debug(err);
        }
      }());
    });

  userRouter.route('/rate')
    .post((req, res) => {
      let userName;
      const { movieTitle } = req.body;
      if (req.user) {
        userName = req.user.username;
      } else {
        userName = '';
      }
      (async function addMovie() {
        try {
          request(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieTitle}`, (error, response, body) => {
            const tmdbItem = JSON.parse(response.body);
            movies = tmdbItem.results;
            res.render(
              'searchView',
              {
                movies,
                userName,
              },
            );
          });
        } catch (err) {
          debug(err);
        }
      }());
    });

  userRouter.route('/submit/:id')
    .post((req, res) => {
      const { id } = req.params;
      const { movieRating } = req.body;
      const url = 'mongodb://localhost:27017';
      const dbName = 'movieDB';
      (async function addMovie() {
        let client;
        try {
          client = await mongoClient.connect(url);
          debug('Connected correctly to movies db');
          const db = client.db(dbName);
          const col = db.collection('movies');
          debug(movies[id]);
          const tmdbInfo = movies[id];
          const movieId = movies[id].id;
          const movie = { movieId, movieRating, tmdbInfo };
          col.insertOne(movie);
          res.redirect('/movies');
        } catch (err) {
          debug(err);
        }
      }());
    });

  userRouter.route('/profile')
    .all((req, res, next) => {
      if (req.user) {
        res.redirect('/movies');
      } else {
        res.redirect('/');
      }
    });
  return userRouter;
}

module.exports = router;
