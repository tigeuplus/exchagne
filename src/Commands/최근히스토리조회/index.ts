import { CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Channel, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('최근히스토리조회')
        .setDescription('최근 히스토리를 조회합니다, (최근 10개까지)'),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
            exchange.query(`SELECT * FROM histories WHERE (sender = '${interaction.user.id}' OR receiver = '${interaction.user.id}') ORDER BY idx DESC LIMIT 0, 10`)
                .then(async (result: any) =>
                {
                    if (result[0].length >= 1)
                    {
                        let message: string = `\`\`\``
                        for (let n: number = 0; n < result[0].length; n ++)
                        {
                            let date: Date = new Date(Number(result[0][n].created))
                            message += `[ ${result[0][n].idx} ]\n수신자: ${result[0][n].receiver}\n송신자: ${result[0][n].sender}\n수량: ${result[0][n].value / 100000000} ${result[0][n].symbol}${result[0][n].memo === '(None)' ? '' : `\n메모: ${result[0][n].memo}`}\n시간: ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${(date.getHours() >= 12) ? '오후' : '오전'} ${String((date.getHours() >= 13) ? (date.getHours() - 12) : (date.getHours())).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}\n\n`
                        }
                            
        
                        logger.info(`${interaction.user.id} - 최근히스토리조회, success`)
                        await interaction.editReply({ content: `${message}\`\`\`` })
                    }
                    else
                    {
                        logger.info(`${interaction.user.id} - 최근히스토리조회, fail`)
                        await interaction.editReply({ content: `\`\`\`히스토리가 존재하지 않습니다\`\`\`` })
                    }
                })
                .catch(async (error: any) =>
                {
                    logger.error(`${interaction.user.id} - 최근히스토리조회, error\n${error}`)
                    await interaction.editReply({ content: `\`\`\`최근히스토리조회 실패하였습니다\`\`\`` })
                })
        else
        {
            logger.info(`${interaction.user.id} - 최근히스토리조회, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}