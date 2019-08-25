/*Global Packages*/
const { Language } = require('node-nlp');

/*Local Packages*/
const database = require("../../../../config/database/initialization.js").run();

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {
	let commandFile = require(file);
	return commandFile.run(content, message, client);
}
//Add Document
function document(path, data) {
	return path.set(data, {
		merge: true
	});
}

exports.help = {
	name: "NLP Add Document",
	description: "Allows users to add nlp documents/questions to the system or the given guild.",
	arguments: ["[text]","[ctx:context]"],
	optional: ["<lang:ISO>"],
	information: Object.keys({})
};

exports.run = async (options, message, args, client) => {

	let lang = "en";
	let ctx = "context.unknown";

	if (/lang:/.test(args[args.length-1]) && args[args.length-1].split(":")[1]) {
		lang = args[args.length-1].split(":")[1] + "!";
		args.pop()
	}

	if (/ctx:/.test(args[args.length-1]) && args[args.length-1].split(":")[1]) {
		ctx = args[args.length-1].split(":")[1];
		args.pop()
	}

	let text = args.join(" ");

	if (!lang.endsWith("!")) {
		const language = new Language();
		const guess = language.guess(text);
		if (guess[0].alpha2) {
			lang = guess[0].alpha2
		}
	} else {
		lang = lang.substring(0, 4)
	}

	if (message.channel.id === "614595024599908372") {
		let path = database.collection("natural language processing").doc(client._profile.database.name);
		path.get().then(doc => {
			if (doc.exists) {
				let data = doc.data();
				if (!data[ctx]) {
					data[ctx] = {}
				}
				if (data[ctx]["documents"]) {

				} else {
					data[ctx] = {
						"documents": [],
						"answers": [],
						"id": ctx
					}
				}
				data[ctx]["documents"].push({
					text: text,
					lang: lang
				});
				document(path, data)
			} else {
				let data = {
					[ctx]: {
						"documents": [],
						"answers": [],
						"id": ctx
					}
				};
				data[ctx]["documents"].push({
					text: text,
					lang: lang
				});
				document(path, data)
			}
		});
	} else {
		let path = database.collection(options.type).doc(client._profile.database.name).collection("guilds").doc(message.guild.id);
		path.get().then(doc => {
			if (doc.exists) {
				let data = doc.data();
				if (data["nlp"] && data["nlp"][ctx] && data["nlp"][ctx]["documents"]) {

				} else {
					if (data["nlp"][ctx]) {
						data["nlp"][ctx] = {
							"documents": [],
							"answers": [],
							"id": ctx
						}
					} else {
						data["nlp"] = {
							[ctx]: {
								"documents": [],
								"answers": [],
								"id": ctx
							}
						}
					}
				}
				data["nlp"][ctx]["documents"].push({
					text: text,
					lang: lang
				});
				document(path, data)
			} else {
				let data = {
					["nlp"]: {
						[ctx]: {
							"documents": [],
							"answers": [],
							"id": ctx
						}
					}
				};
				data["nlp"][ctx]["documents"].push({
					text: text,
					lang: lang
				});
				document(path, data)
			}
		});
	}

	let content = "Added Document to Database.";

	await runFile(options._return + "send.js", content, message, client)
};