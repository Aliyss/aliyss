
exports.single = async (message, id) => {
	let channels = message.guild.channels.filter(c => c.type === 'text').array();
	for (let current of channels) {
		try {
			let target = await current.messages.fetch(id);
			if (target) return target
		} catch (e) {

		}
	}
};