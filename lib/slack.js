const slack = require('slack');

function status(status) {
  return slack.users.profile
    .set({
      token: process.env.SLACK_TOKEN,
      profile: JSON.stringify({
        "status_text": status.text || '',
        "status_emoji": status.emoji || '',
      })
    });
}

function dnd(duration) {
  return slack.dnd.setSnooze({
    token: process.env.SLACK_TOKEN,
    num_minutes: duration
  });
}

module.exports = {
  status: status,
  dnd: dnd
};
