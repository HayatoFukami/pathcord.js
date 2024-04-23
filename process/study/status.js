const { Events, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		try {
			if (interaction.commandName !== 'study') {
				return;
			}
			else if (interaction.options.getSubcommand() !== 'status') {
				return;
			}
		} catch (e) {
			return e;
		}

		const guild = interaction.guild;
		let member;

		if (interaction.options.getUser('メンバー')) {
			member = interaction.options.getUser('メンバー');
		}
		else {
			member = interaction.user;
		}

		const totalSessions = await sql.allTotalSessions(guild.id);

		let totalCount = 0, totalSec = 0, totalRank = 0;

		if (totalSessions) {
			for (let i = 0; i < totalSessions.length; i++) {
				if (totalSessions[i]['member'] === String(member.id)) {
					totalCount = totalSessions[i]['count'];
					totalSec = totalSessions[i]['total'];
					totalRank = (i + 1);
					break;
				}
			}
		}

		const totalTime = secToTime(totalSec);

		const week = getStartAndEndOfWeek();

		const weekSessions = await sql.allWeekSessions(guild.id, week.startOfWeek, week.endOfWeek);

		let weekCount = 0, weekSec = 0, weekRank = 0;

		if (weekSessions) {
			for (let i = 0; i < weekSessions.length; i++) {
				if (weekSessions[i]['member'] === String(member.id)) {
					weekCount = weekSessions[i]['count'];
					weekSec = weekSessions[i]['total'];
					weekRank = (i + 1);
					break;
				}
			}
		}

		const weekTime = secToTime(weekSec);

		const embed = new EmbedBuilder()
			.setColor(0xFFFFFF)
			.setTitle('ステータス')
			.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
			.addFields(
				{
					name: '累計勉強時間',
					value: `${totalTime['hours']}時間 ${totalTime['minutes']}分 ${totalTime['seconds']}秒`,
					inline: true,
				},
				{
					name: '累計勉強回数',
					value: `${totalCount}回`,
					inline: true,
				},
				{
					name: '累計ランキング',
					value: `${totalRank}位`,
					inline: true,
				},
				{
					name: '週間勉強時間',
					value: `${weekTime['hours']}時間 ${weekTime['minutes']}分 ${weekTime['seconds']}秒`,
					inline: true,
				},
				{
					name: '週間勉強回数',
					value: `${weekCount}回`,
					inline: true,
				},
				{
					name: '週間ランキング',
					value: `${weekRank}位`,
					inline: true,
				},
			);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

const db = new sqlite3.Database('./database/study.db');

const sql = {
	allTotalSessions: (guildId) => new Promise((resolve, reject) => {
		db.all(
			'select clm_member_id as member, sum(clm_total) as total, count(clm_total) as count from tbl_session where clm_guild_id = ? and clm_total is not null group by clm_member_id order by sum(clm_total) desc;',
			[guildId],
			(err, rows) => {
				if (err) {
					return reject(err);
				}
				resolve(rows);
			},
		);
	}),
	allWeekSessions: (guildId, startOfWeek, endOfWeek) => new Promise((resolve, reject) => {
		db.all(
			'select clm_member_id as member, sum(clm_total) as total, count(clm_total) as count from tbl_session where clm_guild_id = ? and clm_start_timestamp >= ? and clm_end_timestamp <= ? and clm_total is not null group by clm_member_id order by  sum(clm_total) desc;',
			[guildId, startOfWeek, endOfWeek],
			(err, rows) => {
				if (err) {
					return reject(err);
				}
				resolve(rows);
			},
		);
	}),
};

const secToTime = (seconds) => {
	const totalMinutes = Math.floor(seconds / 60);
	const totalHours = Math.floor(totalMinutes / 60);

	const remainingMinutes = totalMinutes % 60;
	const remainingSeconds = seconds % 60;

	return {
		hours: totalHours,
		minutes: remainingMinutes,
		seconds: remainingSeconds,
	};
};

const getStartAndEndOfWeek = () => {
	let today = new Date();
	today.setHours(0, 0, 0, 0);
	let weekday = today.getDay();
	let startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - weekday);
	let endOfWeek = new Date(today);
	endOfWeek.setDate(startOfWeek.getDate() + 6);

	return {
		startOfWeek,
		endOfWeek,
	};
};
