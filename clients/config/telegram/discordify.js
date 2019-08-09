

exports.run = (msg) => {

	msg.content = msg.text;
	//msg.from = msg.update.message.from;
	return msg
};