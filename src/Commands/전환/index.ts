import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Coin, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('전환')
        .setDescription('자신이 가지고 있는 TGX를 GAMB로 전환합니다')
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('수량')
                .setDescription('전송할 수량')
                .setRequired(true)),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let value: number = (Number(interaction.options.get('수량', true).value) * 100000000)
            if (Math.sign(value) > 0)
            {
                let balance: number = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', 'TGX') AS balance`)))[0][0]?.balance
                if (balance >= value)
                {
                    await exchange.query(`INSERT INTO histories (receiver, sender, memo, symbol, value) VALUES ('admin', '${interaction.user.id}', '전환 ', 'TGX', ${value})`)
                    await exchange.query(`INSERT INTO histories (receiver, sender, memo, symbol, value) VALUES ('${interaction.user.id}', 'admin', '전환 ', 'GAMB', ${value})`)

                    logger.info(`${interaction.user.id} - 전환 수량:${value}, success`)
                    await interaction.editReply({ content: `\`\`\`전환이 완료되었습니다\`\`\`` })
                }
                else
                {
                    logger.info(`${interaction.user.id} - 전환 수량:${value}, fail`)
                    await interaction.editReply({ content: `\`\`\`잔액이 부족합니다\`\`\`` })
                }
            }
            else
            {
                logger.info(`${interaction.user.id} - 전환 수량:${value}, fail`)
                await interaction.editReply({ content: `\`\`\`수량은 양수여야 합니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 전환, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}