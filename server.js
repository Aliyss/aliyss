/*Global Packages*/
const fs = require('fs');
const { NlpManager } = require("node-nlp");
let all_clients = [];

/*Local Packages*/
const config = require('./modules/store/command_config.json');
const trainnlp = require("./modules/nlp/train-nlp.js");
const db_deinitialization = require("./config/database/db_deinitialization");

/*Local Functions*/
//Run File
function runFile(file, nlgManager) {

	let commandFile = require(file);
	return commandFile.run(nlgManager);

}

config.main_directory = __dirname.replace(/\\/g, "/");

fs.readdir('./clients', async function(err, items) {

	const nlpManager = new NlpManager({ languages: ['en', 'de', 'nl'], ner: { useDuckling: false }});

	await nlpManager.train();
	nlpManager.save();

	await trainnlp(nlpManager, console.log);

	for (let i = 0; i < items.length; i++) {

		if (items[i].endsWith(".js")) {
			all_clients.push(await runFile(`./clients/${items[i]}`, nlpManager))
		}

	}

	setInterval(() => {update()}, 30*60*1000);

	function update() {
		for (let i = 0; i < all_clients.length; i++) {
			for (let j = 0; j < all_clients[i].length; j++) {
				db_deinitialization.de_initialize(all_clients[i][j].client, all_clients[i][j].config.options)
			}
		}
		console.log(`[Processes] Database updated at: ${get_current_date_time()}`)
	}

});

/*
process.on('unhandledRejection', (error, promise) => {
	//console.error(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
	//console.error(' The error was: ', error );
});
*/

process.on('exit', code => {
	if (code === 0) {
		(async () => {
			for (let i = 0; i < all_clients.length; i++) {
				for (let j = 0; j < all_clients[i].length; j++) {
					await db_deinitialization.de_initialize(all_clients[i][j].client, all_clients[i][j].config.options);
				}
			}
			console.log(`[Processes] Database updated at: ${get_current_date_time()} with code ${code}.`);
			await process.emit("exit", 1)
		})();
	} else if (code === 130) {

		let save_data = [];
		for (let i = 0; i < all_clients.length; i++) {
			for (let j = 0; j < all_clients[i].length; j++) {
				let client = all_clients[i][j].client;
				let options = all_clients[i][j].config.options;
				let {_files, _users, _guilds, _profile} = client;
				save_data.push({_files, _users, _guilds, _profile, options: options});
			}
		}

		fs.writeFileSync('./config/client/lc_database.json', JSON.stringify(save_data, null, 4));
		console.log(`[Processes] Fallback file updated at: ${get_current_date_time()} with code ${code}.`);
		process.emit("exit", 1)
	} else if (code === 1) {
		console.log(`[Processes] Clean Exit with code: ${code}.`);
		process.exit()
	} else {
		console.log(`[Processes] Ugly Exit with code: ${code}.`);
		process.exit()
	}
});

let get_current_date_time = () => {
	let today = new Date();
	let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	let currentHours = ('0'+today.getHours()).slice(-2);
	let currentMins = ('0'+today.getMinutes()).slice(-2);
	let currentSecs = ('0'+today.getSeconds()).slice(-2);
	let time = currentHours + ":" + currentMins + ":" + currentSecs;
	return date + ' ' + time;
};

console.log(`[Processes] ${process.pid} started at ${get_current_date_time()}`);