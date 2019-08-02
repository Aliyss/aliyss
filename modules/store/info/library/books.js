const Discord = require('discord.js');
const merge = require('deepmerge');
const Vibrant = require('node-vibrant');
const rgb = require('rgb-to-int');
const libgen = require('libgen');


/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, data, n, palette) {

	let su_color = null;

	if (palette) {
		let rgb_product = {
			red: palette['Vibrant']['rgb'][0],
			green: palette['Vibrant']['rgb'][1],
			blue: palette['Vibrant']['rgb'][2]
		};
		su_color = rgb(rgb_product)
	}

	let auth_name = null;
	let thum_url = null;
	if (data[n]) {
		auth_name = "Book Data: " + data[n].title;
		thum_url = "http://booksdescr.org/covers/" + data[n]['coverurl']
	}

	return {
		title: null,
		description: null,
		author: {
			name: auth_name
		},
		color: su_color,
		thumbnail: {
			url: thum_url
		},
		footer: null
	}
}

exports.information = {
	list: function (data) {
		let field_val = [];

		for (let n = 0; n < data.length; n++) {
			field_val.push({
				name: `${n + 1}. ${data[n].title} [${data[n].year}] [${data[n].extension}]`,
				value: `\`\`Authors: ${data[n].author}\`\`\n` +
					`\`\`Language: ${data[n].language}\`\`\n`,
				inline: false
			})
		}

		return {
			description: `Found: ${data.length} books.`,
			timestamp: null,
			fields: field_val,
			thumbnail: null,
			author: {
				name: "Search Result for "
			},
		}
	},
	title: function (data, n) {
		return {
			fields: [{
				name: "Title",
				value: (data[n].title) ? data[n].title : "unknown"
			}]
		}
	},
	topic: function (data, n) {
		return {
			fields: [{
				name: "Topic",
				value: (data[n].topic !== "") ? data[n].topic : "unknown"
			}]
		}
	},
	year: function (data, n) {
		return {
			fields: [{
				name: "Year",
				value: (data[n].year !== 0 && data[n].year !== "") ? data[n].year : "unknown"
			}]
		}
	},
	edition: function (data, n) {
		return {
			fields: [{
				name: "Edition",
				value: (data[n].edition !== "") ? data[n].edition : "unknown"
			}]
		}
	},
	description: function (data, n) {
		return {
			fields: [{
				name: "Description",
				value: (data[n].descr !== "") ? data[n].descr : "unknown"
			}]
		}
	},
	download: function (data, n) {
		return {

			fields: [{
				name: `Download Link`,
				value: (data[n].md5 !== "") ? `[Download link](http://download.library1.org/main/${data[n].id.substring(0, data[n].id.length - 3)}000/${data[n].md5.toLowerCase()}/book.${data[n].extension})\n
					Keep the new tab open until you get a response.\nIt takes some time.` : "Link does not work."
			}]
		}
	},
	language: function (data, n) {
		return {
			fields: [{
				name: "Language",
				value: (data[n].language !== "") ? data[n].language : "unknown"
			}]
		}
	},
	author: function (data, n) {
		return {
			fields: [{
				name: "Author(s)",
				value: (data[n].author !== "") ? data[n].author : "unknown"
			}]
		}
	},
	pages: function (data, n) {
		return {
			fields: [{
				name: "Pages",
				value: (data[n].pages !== 0 && data[n].pages !== "") ? data[n].pages : "unknown"
			}]
		}
	},
	extension: function (data, n) {
		return {
			fields: [{
				name: "Extension",
				value: (data[n].extension !== "") ? data[n].extension : "unknown"
			}]
		}
	},
	tags: function (data, n) {
		return {
			fields: [{
				name: "Tags",
				value: (data[n].tags !== "") ? data[n].tags.split(";").join(" | ") : "unknown"
			}]
		}
	},
	publisher: function (data, n) {
		return {
			fields: [{
				name: "Publisher",
				value: (data[n].publisher !== "") ? data[n].publisher : "unknown"
			}]
		}
	},
	filesize: function (data, n) {

		function bytesToSize(bytes, seperator = "") {
			const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes === 0) return 'n/a';
			const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
			if (i === 0) return `${bytes}${seperator}${sizes[i]}`;
			return `${(bytes / (1024 ** i)).toFixed(1)}${seperator}${sizes[i]}`
		}

		return {
			fields: [{
				name: "File Size",
				value: (data[n].filesize !== "") ? bytesToSize(data[n].filesize, " ") : "unknown"
			}]
		}
	},
	cover: function (data, n) {
		return {
			thumbnail: null,
			image: {
				url: (data[n]['coverurl'] !== "") ? "http://booksdescr.org/covers/" + data[n]['coverurl'] : "unknown"
			},
		}
	},
	info: function (data, n) {
		let override_embed = {
			description: `${data[n].title}`,
			timestamp: null,
			thumbnail: {
				url: (data[n]['coverurl'] !== "") ? "http://booksdescr.org/covers/" + data[n]['coverurl'] : "unknown"
			},
		};

		let embed_arr = [
			this.list(data, n), override_embed
		];

		return merge.all(embed_arr)
	}
};

exports.help = {
	name: "Books",
	description: "Gets the current information of the given book.",
	arguments: ["[BookName]"],
	optional: ["{SearchIn}"],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	try {

		let information = exports.information;

		let function_name = "info";
		let main_title = "Book List: ";


		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		let search = args.join(" ");

		let url = libgen.mirror(function (err, urlString) {
			if (err) {
				console.error(err);
			} else {
				return urlString
			}
		});

		const options_x = {
			mirror: (url) ? url : "http://gen.lib.rus.ec/",
			query: search,
			count: 10,
			search_in: "def",
			sort_by: "year",
			reverse: true
		};

		libgen.search(options_x, async (err, data) => {
			if (err) {
				await runFile(options._return + "send.js", err.toString(), message, client);
				return console.error(err);
			} else {
				let n = data.length;
				let member = message.guild;
				let firs_embed = embedder(member, data);
				let func_name = "list";

				let f_embed = merge(firs_embed, information[func_name](data));

				await runFile(options._return + "send.js", {embed: f_embed}, message, client);
				const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});

				collector.on('collect', m => {
					if (!/\d*/.test(m.content)) {
						m.channel.send("Please input a number.")
					} else if (m.content.match(/\d*/g)[0] > n) {
						m.channel.send("Your number is too high.")
					} else if (m.content.match(/\d*/g)[0] > n) {
						m.channel.send("Your number is too low.")
					} else {
						n = m.content.match(/\d*/g)[0] - 1;
						member = message.guild;
						let func_name = function_name;

						let v = new Vibrant("http://booksdescr.org/covers/" + data[n]['coverurl']);
						v.getPalette().then((palette) => {
							let fir_embed = embedder(member, data, n, palette);
							let f_embed = merge(fir_embed, information[func_name](data, n));
							runFile(options._return + "send.js", {embed: f_embed}, message, client);
							collector.stop();
						});

					}
				});
			}
		});

	} catch (e) {
		console.log(e)
	}
};