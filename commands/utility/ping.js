const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!を返します。'),
	async execute(interaction) {
		await interaction.reply({
			content: 'Pong!',
			ephemeral: true,
		});
	},
};