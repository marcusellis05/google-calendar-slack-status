const slack = require('./slack');

function setSlackStatus(status) {
	return slack.users.profile
		.set({
			token: process.env.SLACK_TOKEN,
			profile: JSON.stringify({
				"status_text": status.text,
				"status_emoji": status.emoji,
			})
		});
}

function setSlackDND(duration) {
	return slack.dnd.setSnooze({
		token: process.env.SLACK_TOKEN,
		num_minutes: duration
	});
}

module.exports = {
	status: setSlackStatus,
	dnd: setSlackDND
};
