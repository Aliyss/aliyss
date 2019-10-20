/*Global Variables*/
const Doc = require('discord.js-docs');

/*Local Variables*/
let commandFile;

/*Local Functions*/
//Run File
function runFile(file, client, object, embed, edit, override) {
	commandFile = require(file);
	commandFile.run(client, object, embed, edit, override);
}

function GetDocumentation(path) {
	return new Promise(function(resolve) {
		//Firebase: Get Profile Document
		path.get().then(doc => {
			if (doc.exists) {
				resolve(doc.data())
			} else {
				resolve(null);
			}
		});
	});
}

function SetDocumentation(path, embed) {
	//Firebase: Get Command Document
	return path.set({
		"embed": embed
	}, {
		merge: true
	})
}

exports.help = {
	arguments: ["[search]"],
	optional: ["{version}"],
	information: Object.keys({}),
	name: "JavaScript Documentation",
	description: "Returns current speed of the RLS-Legacy",
	permissions: ["SEND_MESSAGES"]
};

//Export: from @/store/CommandHandler/index.js
exports.run = async (options, message, args, client) => {

	let jsDocSetup = "https://discord.js.org/#/docs/main/stable/";

	let ver = "master";
	if (/ver:/.test(args[args.length-1]) && args[args.length-1].split(":")[1]) {
		ver = args[args.length-1].split(":")[1];
		args.pop()
	}

	let database = require("../../../../config/database/db_initialization.js").run();
	let path = database.collection("commands").doc("documentation-discord-javascript").collection("saves").doc(args.join("-"));
	let docref = await GetDocumentation(path);

	if (docref === null) {
		let doc = await Doc.fetch(ver);
		let info = doc.search(args.join("#"));

		let descrip = "No information found";

		let embed = {

		};

		if (info !== null) {

			let fields = [];

			if(info[0].internal_type) {
				fields.push({
					name: "Internal Type",
					value: `` + info[0].internal_type + ``,
					inline: true
				})
			}

			if(info[0].type) {
				fields.push({
					name: "Type",
					value: `` + info[0].type + ``,
					inline: true
				})
			}

			if(info[0].nullable) {
				fields.push({
					name: "Nullable",
					value: `` + info[0].nullable + ``,
					inline: true
				})
			}

			if(info[0].deprecated) {
				fields.push({
					name: "Deprecated",
					value: `` + info[0].deprecated + ``,
					inline: true
				})
			}

			if(info[0].access) {
				fields.push({
					name: "Access",
					value: `` + info[0].access + ``,
					inline: true
				})
			}

			if(info[0].scope) {
				fields.push({
					name: "Scope",
					value: `` + info[0].scope + ``,
					inline: true
				})
			}

			if(info[0].docType) {
				fields.push({
					name: "DocType",
					value: `` + info[0].docType + ``,
					inline: true
				})
			}

			embed = {
				author: {
					name: `Discord | {Error} | DiscordJS`.replace("{Error}", info[0]["name"]),
					icon_url: "https://i.imgur.com/ZOKp8LH.jpg"
				},
				title: null,
				color: 7506394,
				footer: {
					icon_url: null,
					text: "Discord JavaScript API Documentation"
				},
				description: info[0].description,
				fields: fields
			}
		}

		if (embed.fields.length > 0) {
			//SetDocumentation(path, embed);
		}
		return embed
	} else {
		let embed = docref.embed;
		return embed
	}
};