
/*Global Packages*/
const discord_alice = require('discord.js');
const client = new discord_alice.Client();

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
const token = config.token["alice"];

exports.run = () => {

	//Client: joins a server
	client.on("guildCreate", guild => {

	});

	//Client: leaves a server
	client.on("guildDelete", guild => {

	});

	//Client: receives a message
	client.on('message', message => {
		runFile(aliyssium.main_directory + aliyssium.locations.commandHandler, message)
	});

	//Client: is ready
	client.on('ready', async () => {
		console.log('DISCORD_alice: Ready.');
		console.log('DISCORD_alice: Initialization complete.');
		config.options._return = aliyssium.main_directory + config.options._return
	});

	//Client: login
	client.login(token).then(() => {
		console.log('----- DISCORD_alice -----');
		console.log("DISCORD_alice: Authentication successful.")
	});
};
