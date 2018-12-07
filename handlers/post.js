const slack = require('../lib/slack');
const moment = require('moment');

// the end event can come some time after the actual end, and in the case of
// back to back meeetings, we might actually receive the end event for the
// first meeting after the start event of the second meeting. so we use this
// to keep track whether the end event is for the same start event.
// and yes, this should be stored in a more persistent way, but i'm lazy.
let prevUrl = '';

const DND_TOKEN = ' [DND]';
const DATE_FORMAT = 'MMM D, YYYY [at] hh:mmA';
const EMOJI = ':calendar:';

module.exports = (req, res, next) => {
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) {
    res.status(401);
    res.send('Unauthenticated: missing token');
    return;
  }

  let status = req.body.title;
  const url = req.body.url;
  const clearStatus = req.body.clear && url === prevUrl;

  if (clearStatus) {
    prevUrl = '';
    slack.status({})
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

  prevUrl = url;

  // parse event start/stop time
  const start = moment(req.body.start, DATE_FORMAT);
  const end = moment(req.body.end, DATE_FORMAT);
  const duration = end.diff(start, 'minutes');

  if (!status) {
    res.status(400);
    res.send('Bad request - missing required value for "status"');
    return;
  }

  // check for DND
  if (status.includes(DND_TOKEN)) {
    slack.dnd(duration);
    status = status.replace(DND_TOKEN, '');
  }

  // set status
  slack.status({
    text: `${status} from ${start.format('h:mm')} to ${end.format('h:mm a')} ${process.env.TIME_ZONE}`,
    emoji: EMOJI
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
