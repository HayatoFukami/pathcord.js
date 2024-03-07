const {Events} = require('discord.js')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('./database/study.db')

const sql = {

}

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {

	}
}