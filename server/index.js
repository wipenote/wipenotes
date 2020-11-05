// require('module-alias/register');
require('dotenv').config();
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser')

const routes = require('./routes');

const app = express();

app.set('view engine', 'njk');

nunjucks.configure('server/templates', {
  autoescape: true,
  express: app,
  noCache: true
});

// app.locals.h = helpers;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.use('/assets', express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  return res.render('pages/home');
});

// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'DEVELOPMENT' ? err : {};
  
  res.status(err.status || 500);
  res.render('pages/error');
});

app.listen(process.env.PORT || 4555, '0.0.0.0');
