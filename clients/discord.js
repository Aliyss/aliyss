
/*Global Packages*/
const Discord = require('discord.js');
const client = new Discord.Client();

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
const token = process.env.token || config.token;

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
		console.log('DISCORD: Ready.');
		console.log('DISCORD: Initialization complete.');
		config.options._return = aliyssium.main_directory + config.options._return
	});

	//Client: login
	client.login(token).then(() => {
		console.log('----- DISCORD -----');
		console.log("DISCORD: Authentication successful.")
	});
};
