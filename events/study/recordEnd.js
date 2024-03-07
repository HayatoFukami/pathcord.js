const { Events } = require('discord.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/study.db');

const sql = {
	getMemberSession: (channel, member) => new Promise((resolve, reject) => {
		db.get(
			'select * from tbl_session where clm_channel_id = ? and clm_member_id = ? and clm_end_timestamp is null;',
			[channel.id, member.id],
			(err, row) => {
				if (err) {
					reject(err);
				}
				resolve(row);
			},
		);
	}),
	updateMemberSession: (channel, member, end, total) => new Promise((resolve, reject) => {
		db.run(
			'update tbl_session set clm_end_timestamp = ?, clm_total = ? where clm_channel_id = ? and clm_member_id = ? and clm_end_timestamp is null;',
			[end, total, channel.id, member.id],
			(err) => {
				if (err) {
					reject(err);
				}
				resolve()
			},
		);
	}),
};

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const member = oldState.member;
		const guild = oldState.guild;
		const oldChannel = oldState.channel;
		const newChannel = newState.channel;

		if (member.bot || !oldChannel) {
			return;
		}

		if (!(!newChannel || (oldChannel !== newChannel))) {
			return;
		}

		const memberSession = await sql.getMemberSession(oldChannel, member);

		if (!memberSession) {
			return;
		}

		const now = Date.now();
		const total = now - memberSession['clm_start_timestamp'];

		await sql.updateMemberSession(oldChannel, member, now, total);

		return console.info(`Recorded end time: ${member.name}`);
	},
};