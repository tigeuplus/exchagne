import { CommandInteraction, SlashCommandBuilder, SlashCommandNumberOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Transaction, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('거래조회')
        .setDescription('거래 요청을 조회합니다')
        .addNumberOption((option: SlashCommandNumberOption): SlashCommandNumberOption =>
            option
                .setName('번호')
                .setDescription('조회할 거래 번호')
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
                {
                    logger.info(`${interaction.user.id} - 거래조회 번호:${idx}, success`)

                    let date: Date = new Date(Number(transaction.created))
                    await interaction.editReply({ content: `\`\`\`[ ${transaction.symbol} ${transaction.type === 'buy' ? '매수' : '매도'} - ${transaction.idx} ]\n수량: ${transaction.value / 100000000}\n가격: ${transaction.price / 100000000}\n처리 수량: ${transaction.process / 100000000}\n시간: ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${(date.getHours() >= 12) ? '오후' : '오전'} ${String((date.getHours() >= 13) ? (date.getHours() - 12) : (date.getHours())).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}\`\`\`` })
                }
                else
                {
                    logger.info(`${interaction.user.id} - 거래조회 번호:${idx}, fail`)
                    await interaction.editReply({ content: `\`\`\`자신의 거래가 아닙니다\`\`\`` })
                }
            else
            {
                logger.info(`${interaction.user.id} - 거래조회 번호:${idx}, fail`)
                await interaction.editReply({ content: `\`\`\`존재하지 않는 거래입니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 거래조회, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}