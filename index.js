const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const handlers = require('./handlers');

const app = express();
const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

app.post('/', handlers.post);

app.get('/', handlers.get);

app.use((req, res, next) => {
  res.status(404);
  res.send('Not found');
});

app.listen(port);
console.log(`Server running on port ${port}`);
