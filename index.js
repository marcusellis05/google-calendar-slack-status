const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const slack = require('slack');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

app.post('/', (req, res, next) => {
	console.log(req.body);
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) {
		res.status(401);
	  res.send('Unauthenticated - missing token');
		return;
	}

  // grab status and clean it up
  let status = req.body.title;
  const dndToken = ' [DND]';
  // parse event start/stop time
  const dateFormat = 'MMM D, YYYY [at] hh:mmA';
  const start = moment(req.body.start, dateFormat);
  const end = moment(req.body.end, dateFormat);

	if (!status) {
		res.status(400);
	  res.send('Bad request - missing required value for "status"');
		return;
	}

  // check for DND
  if (status.includes(dndToken)) {
    slack.dnd.setSnooze({
      token: process.env.SLACK_TOKEN,
      num_minutes: end.diff(start, 'minutes')
    });
    status = status.replace(dndToken, '');
  }

	const now = moment();
	const expires = end.valueOf()
	console.log('now:', now.format(), now.unix(), now.valueOf());
	console.log('start:', start.format(), start.unix(), start.valueOf());
	console.log('end:', end.format(), end.unix(), end.valueOf());

  // set status
  slack.users.profile.set({
    token: process.env.SLACK_TOKEN,
    profile: JSON.stringify({
      "status_text": `${status} from ${start.format('h:mm')} to ${end.format('h:mm a')} ${process.env.TIME_ZONE}`,
      "status_emoji": ":calendar:",
      "status_expiration": expires
    })
  });
	res.status(200);
  res.send('🤘');
});

app.get('/', (req, res, next) => {
  // welcome message
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome!</title>
        <style>
          pre {
            background-color: #DDD;
            padding: 1em;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <h1>Your Heroku server is running!</h1>
        <p>You'll need the following information for your IFTTT recipe:</p>
        <h3>Body</h3>
<pre>{
  "title":"<<<{{Title}}>>>",
  "start":"{{Starts}}",
  "end":"{{Ends}}",
  "token": "${process.env.SECRET_TOKEN}"
}</pre>
      </body>
    </html>
  `);
});

app.use((req, res, next) => {
  res.status(404);
  res.send('Not found');
});

app.listen(port);
console.log(`Server running on port ${port}`);
