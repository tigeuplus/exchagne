import { CommandInteraction, SlashCommandBuilder, SlashCommandNumberOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Transaction, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('거래삭제')
        .setDescription('거래를 삭제합니다')
        .addNumberOption((option: SlashCommandNumberOption): SlashCommandNumberOption =>
            option
                .setName('번호')
                .setDescription('삭제할 거래 번호')
                .setRequired(true)),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let idx: number = Number(interaction.options.get('번호', true).value)
            let transaction: Transaction | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM transactions WHERE idx = ${idx}`)))[0][0]
            if (transaction)
                if (transaction.id === interaction.user.id)
                    exchange.query(`DELETE FROM transactions WHERE idx = ${idx}`)
                        .then(async (): Promise<void> =>
                        {
                            logger.info(`${interaction.user.id} - 거래삭제 번호:${idx}, success`)
                            await interaction.editReply({ content: `\`\`\`거래삭제가 완료되었습니다\`\`\`` })
                        })
                        .catch(async (error: any): Promise<void> =>
                        {
                            exchange.rollback()
                            
                            logger.info(`${interaction.user.id} - 거래삭제 번호:${idx}, fail`)
                            await interaction.editReply({ content: `\`\`\`거래삭제를 실패하였습니다\`\`\`` })
                        })
                else
                {
                    logger.info(`${interaction.user.id} - 거래삭제 번호:${idx}, fail`)
                    await interaction.editReply({ content: `\`\`\`자신의 거래가 아닙니다\`\`\`` })
                }
            else
            {
                logger.info(`${interaction.user.id} - 거래삭제 번호:${idx}, fail`)
                await interaction.editReply({ content: `\`\`\`존재하지 않는 거래입니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 거래삭제, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}