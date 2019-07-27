

exports.run = (msg) => {
	msg.content = msg.body;
	msg.createdTimestamp = msg.timestamp;
	return msg
};