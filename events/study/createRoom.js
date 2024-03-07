const { Events } = require('discord.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/study.db');

const sql = {
	getCreateChannel: (channel) => new Promise((resolve, reject) => {
		db.get(
			'select * from tbl_create where clm_channel_id = ?;',
			[channel.id],
			(err, row) => {
				if (err) {
					return reject(err);
				}
				resolve(row);
			},
		);
	}),
	insertRoom: (guild, room, member) => new Promise((resolve, reject) => {
		db.run(
			'insert into tbl_room values (?, ?, ?);',
			[guild.id, room.id, member.id],
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
		const channel = newState.channel;
		const member = newState.member;
		const guild = newState.guild;

		if (!channel || member.bot) {
			return;
		}

		if (!await sql.getCreateChannel(channel)) {
			return;
		}

		const room = await guild.channels.create({
			name: `│${member.displayName}の勉強部屋`,
			type: channel.type,
			parent: channel.parent,
			permissionOverwrites: channel.permissions,
		});

		await sql.insertRoom(guild, room, member);

		await member.voice.setChannel(room);

		return console.info(`Created a new room: ${room.name}`);
	},
};
