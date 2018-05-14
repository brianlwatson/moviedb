const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const strategy = require('./src/config/strategies/local.strategy')();
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));
app.use(cookieParser());
app.use(session({ secret: 'movies' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const movieRouter = require('./src/routes/movieRoutes')();
const userRouter = require('./src/routes/userRoutes')();

app.use('/movies', movieRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => {
  let userName;
  const queryString = req.query.valid;
  if (req.user) {
    userName = req.user.username;
  } else {
    userName = '';
  }

  res.render('index', {
    userName,
    queryString,
  });
});

app.listen(port, () => {
  debug(`listening on port ${chalk.red(port)}`);
});
