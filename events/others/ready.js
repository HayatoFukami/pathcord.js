const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	load: true,
	once: true,
	execute(client) {
		console.info(`Ready! Logged in as ${client.user.tag}`);
	},
};
