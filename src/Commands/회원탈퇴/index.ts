import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Pool } from 'mysql2/promise'
import { logger } from '../../Logger'
import { User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('회원탈퇴')
        .setDescription('거래소 회원탈퇴를 진행합니다'),
    async execute(interaction: CommandInteraction, pool: Pool): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await pool.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
            await pool.query(`DELETE FROM users WHERE id = '${interaction.user.id}'`)
                .then(async (): Promise<void> =>
                {
                    logger.info(`${interaction.user.id} - 회원탈퇴, success`)
                    await interaction.editReply({ content: `\`\`\`회원탈퇴가 완료되었습니다\`\`\`` })
                })
                .catch(async (error: any): Promise<void> =>
                {
                    logger.error(`${interaction.user.id} - 회원탈퇴, error\n${error}`)
                    await interaction.editReply({ content: `\`\`\`회원탈퇴를 실패하였습니다\`\`\`` })
                })
        else
        {
            logger.info(`${interaction.user.id} - 회원탈퇴, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}