const weather = require('weather-js');
const merge = require('deepmerge');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, first_result) {
	return {
		title: first_result.title + first_result.location.name,
		description: null,
		color: 16776960,
		footer: null
	}
}


exports.run = async (options, message, args, client) => {

	try {

		let information = {
			location: function(first_result) {
				return {
					fields: [
						{
							name: "_\n_**Location**".padEnd(24, `~`).replace(/~/g, "⠀"),
							value: 	"**Name:** " + first_result.location.name.split(",")[0] +
								"\n**Latitude:** " + first_result.location.lat +
								"\n**Longitude:** " + first_result.location.long +
								"\n**Timezone:** " + first_result.location.timezone,
							inline: true
						}
					]
				}
			},
			time: function(first_result) {
				return {
					fields: [
						{
							name: "_\n_**Time**".padEnd(24, `~`).replace(/~/g, "⠀"),
							value: 	"**Date:** " + first_result.current.date +
								"\n**Observation Time:** " + first_result.current.observationtime,
							inline: true
						}
					]
				}
			},
			temperature: function(first_result) {
				return {
					fields: [
						{
							name: "_\n_**Temperature**".padEnd(24, `~`).replace(/~/g, "⠀"),
							value: 	`**Current:** ` + first_result.current.temperature + "°C" +
								`\n**Tomorrow:** ` + ((parseInt(first_result.forecast[2].high) + parseInt(first_result.forecast[2].low))/2) + "°C" +
								`\n**${first_result.forecast[4].day}:** `  + ((parseInt(first_result.forecast[4].high) + parseInt(first_result.forecast[4].low))/2) + "°C",
							inline: true
						}
					]
				}
			},
			status: function(first_result) {
				return {
					fields: [
						{
							name: "_\n_**Status**".padEnd(24, `~`).replace(/~/g, "⠀"),
							value: 	"**Currrent:** " + first_result.current.skytext +
								"\n**Tomorrow:** " + first_result.forecast[2].skytextday +
								`\n**${first_result.forecast[4].day}:** ` + first_result.forecast[4].skytextday,
							inline: true
						}
					]
				}
			},
			other: function(first_result) {
				return {
					fields: [
						{
							name: "_\n_**Other**".padEnd(24, `~`).replace(/~/g, "⠀"),
							value: 	"**Wind:** " + first_result.current.winddisplay +
								"\n**Humidity:** " + first_result.current.humidity + "%" +
								`\n**Feels like:** ${first_result.current.feelslike}°C`,
							inline: true
						}
					]
				}
			},
			info: async function (first_result) {
				let override_embed = {

				};
				let extra_field = {
					fields: [
						{
							name: "_\n_",
							value: "_\n_",
							inline: true
						}
					]
				};

				let embed_arr = [
					this.location(first_result),
					this.other(first_result),
					this.time(first_result),
					this.status(first_result),
					this.temperature(first_result),
					extra_field,
					override_embed
				];

				return await merge.all(embed_arr)
			}
		};

		let function_name = "info";
		let main_title = "Weather for: ";


		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		let search = args.join(", ");

		weather.find({search: `${search}`, degreeType: 'C'}, function(err, result) {
			if (result[0]) {
				result[0].title = main_title;
				let base_embed = embedder(message.author, result[0]);
				async function create_embed() {
					let embed = await merge(base_embed, await information[function_name](result[0]));
					await runFile(options._return + "send.js", {embed: embed}, message, client);
				}
				create_embed()
			}
		});

	} catch (e) {
		console.log(e)
	}

};