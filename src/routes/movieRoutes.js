const express = require('express');
const debug = require('debug')('app:movieRoutes');
const mongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const request = require('request');

const movieRouter = express.Router();
const apiKey = 'c9f43165fad7ad8c941c8fab3928b4fc';


function router() {
  movieRouter.route('/')
    .get((req, res) => {
      let userName;
      if (req.user) {
        userName = req.user.username;
      } else {
        userName = '';
      }
      const url = 'mongodb://localhost:27017';
      const dbName = 'movieDB';

      (async function mongo() {
        let client;
        try {
          client = await mongoClient.connect(url);
          const db = client.db(dbName);
          const col = await db.collection('movies');
          const movies = await col.find().sort({ 'tmdbInfo.title': 1 }).toArray();

          res.render(
            'movieListView',
            {
              movies,
              userName,
            },
          );
        } catch (err) {
          debug(err);
        }
        client.close();
      }());
    });


  movieRouter.route('/:id')
    .get((req, res) => {
      const { id } = req.params;
      let userName;
      if (req.user) {
        userName = req.user.username;
      } else {
        userName = '';
      }
      const url = 'mongodb://localhost:27017';
      const dbName = 'movieDB';
      debug(id);
      (async function mongo() {
        let client;
        try {
          client = await mongoClient.connect(url);
          const db = client.db(dbName);
          const col = await db.collection('movies');
          const movie = await col.findOne({ _id: ObjectId(id) });

          res.render(
            'movieView',
            {
              movie,
              userName,
            },
          );
        } catch (err) {
          debug(err);
        }
        client.close();
      }());
    });


  return movieRouter;
}

module.exports = router;
