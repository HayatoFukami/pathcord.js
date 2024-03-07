const { Events } = require('discord.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/study.db');

const sql = {
	getRoomChannel: (channel) => new Promise((resolve, reject) => {
		db.get(
			'select * from tbl_room where clm_channel_id = ?;',
			[channel.id],
			(err, row) => {
				if (err) {
					reject(err);
				}
				resolve(row);
			},
		);
	}),
	insertStartSession: (guild, channel, member) => new Promise((resolve, reject) => {
		db.run(
			'insert into tbl_session values (?, ?, ?, ?, ?, ?);',
			[guild.id, channel.id, member.id, Date.now(), null, null],
			(err) => {
				if (err) {
					reject(err)
				}
				resolve()
			}
		);
	}),
};

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const guild = newState.guild;
		const member = newState.member;
		const newChannel = newState.channel;
		const oldChannel = oldState.channel;

		if (!newChannel || member.bot) {
			return;
		}

		if (!(!oldChannel || (oldChannel !== newChannel))) {
			return;
		}

		if (!await sql.getRoomChannel(newChannel)) {
			return;
		}

		await sql.insertStartSession(guild, newChannel, member);

		return console.info(`Recorded the start time of study: ${member.name}`);
	},
};