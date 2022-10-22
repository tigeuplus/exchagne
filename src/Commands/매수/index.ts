import { CommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Channel, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('매수')
        .setDescription('종목을 매수 요청을 합니다')
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('수량')
                .setDescription('매수 수량')
                .setRequired(true))
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('가격')
                .setDescription('매수 가격')
                .setRequired(true)),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let value: number = (Number(interaction.options.get('수량', true).value!) * 100000000)
            let price: number = (Number(interaction.options.get('가격', true).value!) * 100000000)

            if (Math.sign(value) > 0 && Math.sign(price) > 0)
            {
                let channel: Channel | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM channels WHERE id = '${interaction.channel?.id}' `)))[0][0]
                if (channel)
                {
                    let balance: number | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', 'TGX') AS balance`)))[0][0]?.balance
                    if (balance)
                        if (balance >= ((value / 100000000) * price))
                            exchange.query(`INSERT INTO transactions (id, value, price, symbol, type) VALUES ('${interaction.user.id}', ${value}, ${price}, '${channel.symbol}', 'buy')`)
                                .then(async (): Promise<void> =>
                                {
                                    logger.info(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, success`)
                                    await interaction.editReply({ content: `\`\`\`매수 요청을 성공하였습니다\`\`\`` })
                                })
                                .catch(async (error: any) =>
                                {
                                    exchange.rollback()
                                    
                                    logger.error(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, error\n${error}`)
                                    await interaction.editReply({ content: `\`\`\`매수를 실패하였습니다\`\`\`` })
                                })
                        else
                        {
                            logger.info(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, fail`)
                            await interaction.editReply({ content: `\`\`\`TGX가 부족합니다\`\`\`` })
                        }
                    else
                    {
                        logger.info(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, fail`)
                        await interaction.editReply({ content: `\`\`\`TGX가 부족합니다\`\`\`` })
                    }
                }
                else
                {
                    logger.info(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, fail`)
                    await interaction.editReply({ content: `\`\`\`올바른 채널이 아닙니다\`\`\`` })
                }
            }
            else
            {
                logger.info(`${interaction.user.id} - 매수 수량:${value} 가격:${price}, fail`)
                await interaction.editReply({ content: `\`\`\`수량이나 가격은 양수여야 합니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 매수, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}