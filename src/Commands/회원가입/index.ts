import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('회원가입')
        .setDescription('거래소 회원가입을 진행합니다'),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            logger.info(`${interaction.user.id} - 회원가입, fail`)
            await interaction.editReply({ content: `\`\`\`이미 회원가입이 되어 있습니다\`\`\`` })
        }
        else
            await exchange.query(`INSERT INTO users (id, name) VALUES ('${interaction.user.id}', '${interaction.user.tag}')`)
                .then(async (): Promise<void> =>
                {
                    exchange.query(`INSERT INTO histories (receiver, sender, memo, symbol, value) VALUES ('${interaction.user.id}', 'admin', '회원가입 보상 - TGX', 'TGX', 100000000)`)
                    exchange.query(`INSERT INTO histories (receiver, sender, memo, symbol, value) VALUES ('${interaction.user.id}', 'admin', '회원가입 보상 - TGE', 'TGE', 1000000000)`)

                    logger.info(`${interaction.user.id} - 회원가입, success`)
                    await interaction.editReply({ content: `\`\`\`회원가입이 완료되었습니다\`\`\`` })
                })
                .catch(async (error: any): Promise<void> =>
                {
                    exchange.rollback()
                    
                    logger.error(`${interaction.user.id} - 회원가입, error\n${error}`)
                    await interaction.editReply({ content: `\`\`\`회원가입을 실패하였습니다\`\`\`` })
                })
    }
}