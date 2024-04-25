const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	load: true,
	data: new SlashCommandBuilder()
		.setName('study')
		.setDescription('勉強機能関連のコマンドです。')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('status')
				.setDescription('勉強のステータスの情報を表示します。')
				.addUserOption((option) =>
					option.setName('メンバー')
						.setDescription('ステータス情報を取得したいメンバーを指定できます。'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add_ranking')
				.setDescription('set ranking embed channel.')
		),
	async execute(interaction) {
		return interaction.options.getSubcommand();
	},
};