const { Events, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');

const updateWeekRanking = async (client) => {
	const embeds = await sql.getEmbeds();

	if (!embeds) {
		return;
	}

	for (const embed of embeds) {
		const guild = await client.guilds.fetch(embed['guildId']);
		const channel = await guild.channels.fetch(embed['channelId']);
		const msg = await channel.messages.fetch(embed['msgId']);

		if (!msg) {
			await sql.deleteEmbedRecord(embed['msgId']);
			continue;
		}

		const totalDesc = await sql.allTotalDesc(guild.id); // [[memberId, total, count], ...]

		// week ranking embed
		const rankingEmbed = new EmbedBuilder()
			.setColor(0x7fffbf)
			.setTitle('週間勉強時間ランキング')
			.setDescription('今週の勉強時間の上位10名を表示しています。')
			.setFooter({ text: `更新日時：${new Date().toLocaleString()}` });

		let rank = 1;

		for (const i of totalDesc) {
			const member = await guild.members.fetch(i['memberId']);

			if (!member) {
				continue;
			}

			const hms = secToHMS(i['total']);

			rankingEmbed.addFields({
				name: `${rank}位│${member.displayName}`,
				value: `${hms[0]}時間 ${hms[1]}分 ${hms[2]}秒 [${i['count']}回]`,
				inline: false,
			});

			rank++;
		}

		await msg.edit({ embeds: [rankingEmbed] });
	}

	return await runOneHourLater(client);
};

const db = new sqlite3.Database('./database/study.db');

const sql = {
	getEmbeds: () => new Promise((resolve, reject) => {
		db.all(
			'select clm_guild_id as guildId, clm_channel_id as channelId, clm_message_id as msgId from tbl_week_ranking;',
			[],
			(err, rows) => {
				if (err) {
					return reject(err);
				}
				resolve(rows);
			},
		);
	}),
	deleteEmbedRecord: (msgId) => new Promise((resolve, reject) => {
		db.run(
			'delete from tbl_week_ranking where clm_message_id = ?;',
			[msgId],
			(err) => {
				if (err) {
					return reject(err);
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

module.exports = {
	name: Events.ClientReady,
	load: true,
	once: true,
	async execute(client) {
		await updateWeekRanking(client);
	},
};

const runOneHourLater = async (client) => {
	let now = new Date();
	let oneHourLater = new Date(now.getTime() + (60 * 60 * 1000));
	oneHourLater.setMinutes(0);
	oneHourLater.setSeconds(0);
	oneHourLater.setMilliseconds(0);
	await sleep(oneHourLater.getTime() - now.getTime());
	await updateWeekRanking(client);
};

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

const secToHMS = (sec) => {
	return [sec / 3600, sec % 3600 / 60, sec % 60].map(Math.floor);
};