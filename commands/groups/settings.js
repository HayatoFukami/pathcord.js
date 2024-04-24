const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Botの一般的な設定関連のコマンドです。')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add_moderator_role')
				.setDescription('サーバーのモデレーターに付与されているロールを追加します。')
				.addRoleOption((option) =>
					option.setName('ロール')
						.setDescription('モデレーターロールとして追加したいロールを指定できます。')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove_moderator_role')
				.setDescription('モデレーターロールとしての登録を解除します。')
				.addRoleOption((option) =>
					option.setName('ロール')
						.setDescription('モデレーターロールとしての登録を解除します。')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		return interaction.options.getSubcommand();
	},
};