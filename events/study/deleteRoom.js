const { Events } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
	name: Events.VoiceStateUpdate,
	load: true,
	async execute(oldState, newState) {
		const member = oldState.member;
		const channel = oldState.channel;

		if (member.bot || !channel) {
			return;
		}

		if (!channel.members) {
			return;
		}

		if (!await sql.getRoomChannel(channel)) {
			return;
		}

		await sleep(3);

		if (!channel.members) {
			return;
		}

		await channel.delete();

		await sql.deleteRoomChannel(channel);

		return console.info(`Deleted a room: ${channel.name}`);
	},
};

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
	deleteRoomChannel: (channel) => new Promise((resolve, reject) => {
		db.run(
			'delete from tbl_room where clm_channel_id = ?;',
			[channel.id],
			(err) => {
				if (err) {
					reject(err);
				}
				resolve();
			},
		);
	}),
};

const sleep = (sec) => {
	return new Promise(resolve => setTimeout(resolve, (sec * 1000)));
};