
/*Global Packages*/
const discord = require('discord.js');
const client = new discord.Client();

/*Local Packages*/
const config = require('./config/discord/config.json');
const aliyssium = require('../config/aliyssium.json');

/*Local Functions*/
//Run File
function runFile(file, object) {

	let commandFile = require(file);
	commandFile.run(config.options, object, client);

}

/*Local Variables*/
const profile_name = "alice";
const profile = aliyssium.profiles.discord.filter(function (item) {
	return item.name === profile_name
})[0];
client._profile = profile;
const token = profile.token;

exports.run = () => {


	//client: joins a server
	client.on("guildCreate", guild => {

	});

	//client: leaves a server
	client.on("guildDelete", guild => {

	});

	//client: receives a message
	client.on('message', message => {
		runFile(aliyssium.main_directory + aliyssium.locations.commandHandler, message)
	});


	client.on("messageDelete", (messageDelete) => {
		runFile(aliyssium.main_directory + aliyssium.locations.messageDelete, messageDelete);
	});

	//client: is ready
	client.on('ready', async () => {
		console.log('DISCORD_alice: Ready.');
		console.log('DISCORD_alice: Initialization complete.');
		config.options._return = aliyssium.main_directory + config.options.return
	});

	//client: login
	client.login(token).then(() => {
		console.log('----- DISCORD_alice -----');
		console.log("DISCORD_alice: Authentication successful.")
	});
};
