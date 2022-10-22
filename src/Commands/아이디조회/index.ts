import { CommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('아이디조회')
        .setDescription('유저 ID를 조회합니다')
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('사용자이름')
                .setDescription('조회할 사용자이름')
                .setRequired(true)),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let name: string = String(interaction.options.get('사용자이름', true).value)
            let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE name = '${name}'`)))[0][0]
            if (user)
            {
                logger.info(`${interaction.user.id} - 아이디조회 이름:${name}, success`)
                await interaction.editReply({ content: `\`\`\`아이디조회를 성공하였습니다. ID: ${user.id}\`\`\`` })
            }
            else
            {
                logger.info(`${interaction.user.id} - 아이디조회 이름:${name}, fail`)
                await interaction.editReply({ content: `\`\`\`존재하지 않는 유저입니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 아이디조회, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}