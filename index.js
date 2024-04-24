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
		if (('data' in command) && ('execute' in command) && (command.load)) {
			client.commands.set(command.data.name, command);
			console.info(`Loaded command file: ${file}`);
		}
		else if ((command.load === false) || (command.load === null)) {
			console.warn(`The command at ${filePath} is load option is false.`);
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
		if (event.once && event.load) {
			client.once(event.name, (...args) => event.execute(...args));
			console.warn(`Loaded event file (once): ${file}`);
		}
		else if (event.load) {
			client.on(event.name, (...args) => event.execute(...args));
			console.info(`Loaded event file: ${file}`);
		}
		else {
			console.warn(`The event at ${filePath} is load options false.`);
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
		if (process.load) {
			client.on(process.name, (...args) => process.execute(...args));
			console.info(`Loaded process file: ${file}`);
		}
		else {
			console.warn(`The process at ${filePath} is load option false.`);
		}
	}
}

// タスクファイルのロード
const taskFoldersPath = path.join(__dirname, 'tasks');
const taskFolders = fs.readdirSync(taskFoldersPath);

for (const folder of taskFolders) {
	const taskPath = path.join(taskFoldersPath, folder);
	const taskFiles = fs.readdirSync(taskPath).filter(file => file.endsWith('.js'));
	for (const file of taskFiles) {
		const filePath = path.join(taskPath, file);
		const task = require(filePath);
		if (task.once && task.load) {
			client.once(task.name, (...args) => task.execute(...args));
			console.warn(`Loaded task file (once): ${file}`);
		}
		else if (task.load) {
			client.on(task.name, (...args) => task.execute(...args));
			console.info(`Loaded task file: ${file}`);
		}
		else {
			console.info(`The task at ${filePath} is load option false.`);
		}
	}
}

client.login(token);