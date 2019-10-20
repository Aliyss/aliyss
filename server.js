/*Global Packages*/
const fs = require('fs');
const { NlpManager } = require("node-nlp");


/*Local Packages*/
const config = require('./modules/store/command_config.json');
const trainnlp = require("./modules/nlp/train-nlp.js");

/*Local Functions*/
//Run File
function runFile(file, nlgManager) {

	let commandFile = require(file);
	commandFile.run(nlgManager);

}

config.main_directory = __dirname.replace(/\\/g, "/");

fs.readdir('./clients', async function(err, items) {

	const nlpManager = new NlpManager({ languages: ['en', 'de', 'nl'], ner: { useDuckling: false }});

	await nlpManager.train();
	nlpManager.save();

	await trainnlp(nlpManager, console.log);

	for (let i = 0; i < items.length; i++) {

		if (items[i].endsWith(".js")) {
			await runFile(`./clients/${items[i]}`, nlpManager)
		}

	}

});