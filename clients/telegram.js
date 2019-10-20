
/*Local Packages*/
const config = require('./config/telegram/config.json');
const aliyssium = require(`../config/aliyssium.json`);
const command_config = require('../modules/store/command_config.json');

exports.run = (nlpManager) => {

	const profiles = aliyssium.profiles.telegram.filter(item => {
		if (!item.disabled) {
			return item
		}
	});

	for (let i = 0; i < profiles.length; i++) {

		/*Global Packages*/
		const TelegramBot = require('node-telegram-bot-api');

		const profile_name = profiles[i].name;
		const token = profiles[i].token;
		const client = new TelegramBot(token, {polling: true});
		/*Local Variables*/
		client._profile = JSON.parse(JSON.stringify(profiles[i]));
		client._profile.prefixes.push.apply(client._profile.prefixes, aliyssium.prefixes);

		/*Local Functions*/
		//Run File
		function runFile(file, object, nlpManager) {

			let commandFile = require(file);
			commandFile.run(config.options, object, client, nlpManager);

		}

		function messageFile(file, object) {

			let commandFile = require(file);
			return commandFile.run(object);

		}

		console.log(`TELEGRAM_${profile_name}: Ready.`);

		config.options._return = command_config.main_directory + config.options.return;

		//client: receives a message
		client.on('message', async message => {
			message = await messageFile('./config/telegram/discordify.js', message);
			runFile(command_config.main_directory + command_config.locations.commandHandler, message, nlpManager)
		});
	}

};
