import * as discord from 'discord.js'
import { readdirSync } from 'fs'
import * as path from 'path'
import { logger } from '../Logger'
import { Connection, createConnection, createPool, Pool, PoolConnection } from 'mysql2/promise'
import { scheduleJob } from 'node-schedule'
import { Channel, Coin, Message, Price } from '../Type/Exchange'
import { orderBook, transaction } from '../Process/'

export class Client extends discord.Client 
{
    commands: discord.Collection<unknown, unknown>
    exchange: Pool | undefined
    roulette: Pool | undefined

    constructor()
    {
        super({
            intents:
            [
                discord.IntentsBitField.Flags.DirectMessages,
                discord.IntentsBitField.Flags.DirectMessageReactions,
                discord.IntentsBitField.Flags.DirectMessageTyping,
                discord.IntentsBitField.Flags.Guilds,
                discord.IntentsBitField.Flags.GuildMembers,
                discord.IntentsBitField.Flags.GuildMessages,
                discord.IntentsBitField.Flags.GuildBans,
                discord.IntentsBitField.Flags.GuildIntegrations,
                discord.IntentsBitField.Flags.GuildPresences
            ]
        })

        this.commands = new discord.Collection()
        
        let commandFolders: string[] = readdirSync(path.join(__dirname, '..', 'Commands'))
        for (let folder of commandFolders)
        {
            let command: any = require(path.join(__dirname, '..', 'Commands', folder, 'index.ts'))
            this.commands.set(command.data.name, command)
        }
        
        this.connect()
            .then(async (): Promise<void> =>
            {
                this.once('ready', (): void => { logger.info('Client is ready') })
                this.login(require('../config.json').discord.token)
                
                this.on('interactionCreate', this.interactionCreate)
                this.on('messageCreate', this.messageCreate)
                scheduleJob('0 0 9 * * *', async (): Promise<void> =>
                {

                    let c1: PoolConnection = await this.exchange!.getConnection()
                    let prices: Price[] = JSON.parse(JSON.stringify(await c1.query(`SELECT * FROM prices`)))[0]
                    
                    c1.release()
                    prices.forEach(async (price: Price): Promise<void> =>
                        { 
                            let c2: PoolConnection = await this.exchange!.getConnection()
                            await c2.query(`UPDATE prices SET close = ${price.open}, high = ${price.open}, low = ${price.open} WHERE symbol = '${price.symbol}'`)
                            
                            c2.release()
                        })
                })
            })
    }

    private async orderBookUpdate(exchange: PoolConnection): Promise<void>
    {
        let channels: Channel[] | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM channels `)))[0]
        if (channels)
            for (let n: number = 0; n < channels.length; n ++)
            {
                let message: Message | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM messages WHERE channel = '${channels[n].id}'`)))[0][0]
                let channel: discord.Channel | null = await this.channels.fetch(channels[n].id)
                if (channel)
                    if (channel.type === discord.ChannelType.GuildText)
                        if (message)
                        {
                            let channelMessage: discord.Message<boolean> = await channel.messages.fetch(message.id)
                            let order: string | undefined = await orderBook(exchange, channels[n].symbol)
                            if (order)
                                channelMessage.edit({ content: order })
                        }
                        else
                        {
                            let channelMessage: discord.Message<boolean> = await channel.send({ content: `${channels[n].symbol}` })
                            exchange.query(`INSERT INTO messages (id, channel) VALUES ('${channelMessage.id}', '${channels[n].id}')`)

                            let order: string | undefined = await orderBook(exchange, channels[n].symbol)
                            if (order)
                                channelMessage.edit({ content: order })
                        }
            }
    }

    private async connect(): Promise<void>
    {
        this.exchange = createPool(require('../config.json').database.exchange)
        this.roulette = createPool(require('../config.json').database.roulette)
    }

    private async interactionCreate(interaction: discord.Interaction): Promise<void>
    {
        if (interaction.isCommand())
        {
            let exchange: PoolConnection = await this.exchange!.getConnection()
            let roulette: PoolConnection = await this.roulette!.getConnection()

            let command: any = this.commands.get(interaction.commandName)
            if (command)
                try
                {
                    await interaction.reply({ content: `\`\`\`명령을 처리하고 있습니다\`\`\``, ephemeral: true })
                    await command.execute(interaction, exchange, roulette)
                    
                    await transaction(interaction, exchange)
                    await this.orderBookUpdate(exchange)
                    
                    exchange.release()
                    roulette.release()
                }
                catch (error: any)
                {
                    logger.error(error)

                    exchange.rollback()
                    exchange.release()
                }
        }
    }

    private async messageCreate(message: discord.Message): Promise<void>
    {
        try
        {
            let exchange: PoolConnection = await this.exchange!.getConnection()
            let roulette: PoolConnection = await this.roulette!.getConnection()
            if (message.author.id !== require('../config.json').discord.client)
                if (JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM channels WHERE id = '${message.channelId}'`)))[0][0])
                    await message.delete()
                else
                    if (JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM channels WHERE id = '${message.channelId}'`)))[0][0])
                        await message.delete()
        }
        catch (error: any) {}
    }
}