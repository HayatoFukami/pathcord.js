const { Events } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
	name: Events.InteractionCreate,
	load: false,
	async execute(interaction) {
		try {
			if (interaction.commandName !== 'settings') {
				return;
			}
			else if (interaction.options.getSubcommand() !== 'add_moderator_role') {
				return;
			}
		} catch (e) {
			return e;
		}

		// ToDo 処理を追加
	},
};
