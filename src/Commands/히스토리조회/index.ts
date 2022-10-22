import { CommandInteraction, SlashCommandBuilder, SlashCommandNumberOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { User, History } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('히스토리조회')
        .setDescription('히스토리를 조회합니다')
        .addNumberOption((option: SlashCommandNumberOption): SlashCommandNumberOption =>
            option
                .setName('번호')
                .setDescription('조회할 히스토리 번호')
                .setRequired(true)),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let idx: number = Number(interaction.options.get('번호', true).value)
            let history: History | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM histories WHERE idx = ${idx}`)))[0][0]
            if (history)
                if (history.sender === interaction.user.id || history.receiver === interaction.user.id)
                {
                    logger.info(`${interaction.user.id} - 히스토리조회 번호:${idx}, success`)

                    let date: Date = new Date(Number(history.created))
                    await interaction.editReply({ content: `\`\`\`[ ${history.idx} ]\n수신자: ${history.receiver}\n송신자: ${history.sender}\n수량: ${history.value / 100000000} ${history.symbol}${history.memo === '(None)' ? '' : `\n메모: ${history.memo}`}\n시간: ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${(date.getHours() >= 12) ? '오후' : '오전'} ${String((date.getHours() >= 13) ? (date.getHours() - 12) : (date.getHours())).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}\`\`\`` })
                }
                else
                {
                    logger.info(`${interaction.user.id} - 히스토리조회 번호:${idx}, fail`)
                    await interaction.editReply({ content: `\`\`\`자신의 히스토리가 아닙니다\`\`\`` })
                }
            else
            {
                logger.info(`${interaction.user.id} - 히스토리조회 번호:${idx}, fail`)
                await interaction.editReply({ content: `\`\`\`존재하지 않는 히스토리입니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 히스토리조회, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}

// 100000000 0000