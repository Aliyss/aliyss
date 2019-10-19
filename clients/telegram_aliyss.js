/*Global Packages*/
const TelegramBot = require('node-telegram-bot-api');


/*Local Packages*/
const config = require('./config/telegram/config.json');
const aliyssium = require('../config/aliyssium.json');

const profile_name = "aliyss";
const profile = aliyssium.profiles.telegram.filter(function (item) {
	return item.name === profile_name
})[0];
const token = profile.token;
const client = new TelegramBot(token, {polling: true});
/*Local Variables*/
client._profile = JSON.parse(JSON.stringify(profile));
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

exports.run = (nlpManager) => {

	console.log('TELEGRAM_aliyss: Ready.');
	config.options._return = aliyssium.main_directory + config.options.return;
	//client: receives a message
	client.on('message', async message => {
		message = await messageFile('./config/telegram/discordify.js', message);
		runFile(aliyssium.main_directory + aliyssium.locations.commandHandler, message, nlpManager)
	});

};
