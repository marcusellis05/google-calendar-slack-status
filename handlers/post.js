const slack = require('../lib/slack');
const moment = require('moment');

module.exports = (req, res, next) => {
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) {
    res.status(401);
    res.send('Unauthenticated: missing token');
    return;
  }

  let clearStatus = req.body.clear || false;

  if (clearStatus) {
		slack.status({
			status: '',
			emoji: ''
		})
		.then(() => {
			res.status(200);
			res.send('👍');
		})
		.catch((err) => {
			res.status(500);
			res.send(`Slack API error: ${err}`);
		});
    return;
  }

  // grab status and clean it up
  let status = req.body.title;
  const dndToken = ' [DND]';

  // parse event start/stop time
  const dateFormat = 'MMM D, YYYY [at] hh:mmA';
  const start = moment(req.body.start, dateFormat);
  const end = moment(req.body.end, dateFormat);
	const duration = end.diff(start, 'minutes');

  if (!status) {
    res.status(400);
    res.send('Bad request - missing required value for "status"');
    return;
  }

  // check for DND
  if (status.includes(dndToken)) {
		slack.dnd(duration);
    status = status.replace(dndToken, '');
  }

  // set status
  slack.status({
    text: `${status} from ${start.format('h:mm')} to ${end.format('h:mm a')} ${process.env.TIME_ZONE}`,
    emoji: ":calendar:"
  })
	.then(() => {
		res.status(200);
		res.send('👍');
	})
	.catch((err) => {
		res.status(500);
		res.send(`Slack API error: ${err}`);
	});
};
