const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
	],
});

// コマンドファイルのロード
client.commands = new Collection();
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.info(`Loaded command file: ${file}`);
		}
		else {
			console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// イベントファイルのロード
const eventFoldersPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventFoldersPath);

for (const folder of eventFolders) {
	const eventsPath = path.join(eventFoldersPath, folder);
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
			console.warn(`Loaded event file (once): ${file}`);
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
			console.info(`Loaded event file: ${file}`);
		}
	}
}

// サブコマンドの処理ファイルのロード
const processFoldersPath = path.join(__dirname, 'process');
const processFolders = fs.readdirSync(processFoldersPath);

for (const folder of processFolders) {
	const processPath = path.join(processFoldersPath, folder);
	const processFiles = fs.readdirSync(processPath).filter(file => file.endsWith('.js'));
	for (const file of processFiles) {
		const filePath = path.join(processPath, file);
		const process = require(filePath);
		client.on(process.name, (...args) => process.execute(...args));
		console.info(`Loaded process file: ${file}`);
	}
}

client.login(token);