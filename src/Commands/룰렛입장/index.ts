import { CommandInteraction, GuildMember, Message, Role, SlashCommandBuilder } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { User } from '../../Type/Exchange'
import { Channel } from '../../Type/Roulette'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('룰렛입장')
        .setDescription('룰렛에 입장합니다'),
    async execute(interaction: CommandInteraction, exchange: PoolConnection, roulette: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            if (!JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0])
            {
                let channel: Channel | undefined = JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM channels WHERE id = '${interaction.channel?.id}' `)))[0][0]
                if (channel)
                    if (channel.status === 'stop')
                    {
                        let users: User[] = JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM users WHERE channel = '${channel.id}'`)))[0]
                        if (users.length < 4)
                        {
                            roulette.query(`INSERT INTO users (id, channel, name) VALUES ('${interaction.user.id}', '${channel.id}', '${interaction.user.tag}')`)
    
                            logger.info(`${interaction.user.id} - 룰렛입장, success`)
                            await interaction.editReply({ content: '\`\`\`룰렛에 참가했습니다\`\`\`' })
                        }
                        else
                        {
                            logger.info(`${interaction.user.id} - 룰렛입장, fail`)
                            await interaction.editReply({ content: `\`\`\`룰렛 인원이 다 찼습니다\`\`\`` })
                        }
                    }
                    else
                    {
                        logger.info(`${interaction.user.id} - 룰렛입장, fail`)
                        await interaction.editReply({ content: `\`\`\`이미 룰렛이 진행되고 있습니다\`\`\`` })
                    }
                else
                {
                    logger.info(`${interaction.user.id} - 룰렛입장, fail`)
                    await interaction.editReply({ content: `\`\`\`올바른 채널이 아닙니다\`\`\`` })
                }
            }
            else
            {
                logger.info(`${interaction.user.id} - 룰렛입장, fail`)
                await interaction.editReply({ content: `\`\`\`이미 룰렛에 참가하셨습니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 룰렛입장, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}