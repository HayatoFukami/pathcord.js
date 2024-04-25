const { Events, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
	name: Events.InteractionCreate,
	load: true,
	async execute(interaction) {
		try {
			if (interaction.commandName !== 'study') {
				return;
			}
			else if (interaction.options.getSubcommand() !== 'add_ranking') {
				return;
			}
		} catch (e) {
			return e;
		}

		const guild = interaction.guild;
		const channel = interaction.channel;

		const totalDesc = await sql.allTotalDesc(guild.id);

		const rankingEmbed = new EmbedBuilder()
			.setColor(0x7fffbf)
			.setTitle('週間勉強時間ランキング')
			.setDescription('今週の勉強時間の上位10名を表示しています。')
			.setFooter({ text: `更新日時：${new Date().toLocaleString()}` });

		let rank = 1;

		for (const row of totalDesc) {
			const member = await guild.members.fetch(row['memberId']);

			if (!member) {
				continue;
			}

			const hms = secToHMS(row['total']);

			rankingEmbed.addFields({
				name: `${rank}位│${member.displayName}`,
				value: `${hms[0]}時間 ${hms[1]}分 ${hms[2]}秒 [${row['count']}回]`,
				inline: false,
			});

			rank++;
		}

		const rankingMSG = await channel.send({ embeds: [rankingEmbed] });

		await sql.addRanking(guild.id, channel.id, rankingMSG.id);

		await interaction.reply({
			content: 'ランキングを登録しました。',
			ephemeral: true,
		});
	},
};

const db = new sqlite3.Database('./database/study.db');

const sql = {
	addRanking: (guildId, channelId, msgId) => new Promise((resolve, reject) => {
		db.run(
			'insert into tbl_week_ranking values (?, ?, ?);',
			[guildId, channelId, msgId],
			(err) => {
				if (err) {
					reject(err);
				}
			},
		);
	}),
	allTotalDesc: (guildId) => new Promise((resolve, reject) => {
		let today = new Date();
		let startDay = new Date();
		let endDay = new Date();
		startDay.setDate(today.getDate() - today.getDay());
		startDay.setHours(0);
		startDay.setMinutes(0);
		startDay.setSeconds(0);
		startDay.setMilliseconds(0);
		endDay.setDate(today.getDate() + (6 - today.getDay()));
		endDay.setHours(23);
		endDay.setMinutes(59);
		endDay.setSeconds(59);
		endDay.setMilliseconds(999);

		db.all(
			'select clm_member_id as memberId, sum(clm_total) as total, count(clm_total) as count from tbl_session where clm_guild_id = ? and clm_start_timestamp >= ? and clm_start_timestamp <= ? and clm_total is not null group by clm_member_id order by sum(clm_total) desc;',
			[guildId, startDay.getTime(), endDay.getTime()],
			(err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			},
		);
	}),
};

const secToHMS = (sec) => {
	return [sec / 3600, sec % 3600 / 60, sec % 60].map(Math.floor);
};