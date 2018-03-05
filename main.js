const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
require('express-async-errors');

const app = express();

nunjucks.configure(['lang/', 'lang/en/', 'lang/es/', 'lang/br'], {
  noCache: true,
  express: app,
});

const langMiddleware = (req, res, next) => {
  const {lang} = req.query;
  const {render} = res;
  res.render = tmpl => render.call(res, `${lang || 'en'}/${tmpl}.html`);
  next();
};

app.use(langMiddleware);

app.use('/gfx', express.static(`${__dirname}/gfx`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/js', express.static(`${__dirname}/js`));

app.get('/', async (req, res) => {
  res.redirect('/lesson');
});

app.get('/lesson/', async (req, res) => {
  const {id} = req.query;
  res.render(id || '1000');
});

app.get('/about', async (req, res) => {
  res.render('about');
});

app.get('/news', async (req, res) => {
  res.render('news');
});

app.listen(process.env.PORT || 8000, () => {
  console.log('Server running');
});
