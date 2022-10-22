import { readdirSync } from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import path from 'path'
import { discord } from '../config.json'
import { logger } from '../Logger'

let commands: string[] = []
let commandFolders: string[] = readdirSync(path.join(__dirname, '..', 'Commands'))
for (let folder of commandFolders) 
{
    let command: any = require(`../Commands/${folder}/index.ts`)
    commands.push(command.data.toJSON())
}

new REST({ version: '10' }).setToken(discord.token).put(Routes.applicationCommands(discord.client), { body: commands })
    .then(() => logger.info('Command registration completed!'))
    .catch((error: any) => logger.error(error))