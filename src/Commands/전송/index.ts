import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Coin, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('전송')
        .setDescription('자신이 가지고 있는 종목을 다른 사용자에게 전송합니다')
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('사용자아이디')
                .setDescription('전송 받을 사용자의 아이디')
                .setRequired(true))
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('종목')
                .setDescription('전송할 종목')
                .setRequired(true))
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
            let id: string = String(interaction.options.get('사용자아이디', true).value)
            let symbol: string = String(interaction.options.get('종목', true).value)
            let value: number = (Number(interaction.options.get('수량', true).value) * 100000000)

            if (Math.sign(value) > 0)
            {
                let receiver: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${id}'`)))[0][0]
                if (receiver)
                {
                    let coin: Coin | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM coins WHERE symbol = '${symbol}'`)))[0][0]
                    if (coin)
                    {
                        let balance: number | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', '${symbol}') AS balance`)))[0][0]?.balance
                        if (balance)
                            if (balance >= value)
                                exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${id}', '${interaction.user.id}', ${value}, '${symbol}', '전송 대상:${id} 종목:${symbol} 수량:${value}')`)
                                    .then(async (): Promise<void> =>
                                    {
                                        logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value / 100000000}, success`)
                                        await interaction.editReply({ content: `\`\`\`전송을 성공하였습니다.\n남은 잔액 - ${(balance! - value) / 100000000}\`\`\`` })

                                        await (await interaction.client.users.fetch(id)).send({ content: `\`\`\`${interaction.user.id}님이 ${value / 100000000} ${symbol}를 전송하였습니다\`\`\`` })
                                    })
                                    .catch(async (error: any) =>
                                    {
                                        exchange.rollback()
                                        
                                        logger.error(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, error\n${error}`)
                                        await interaction.editReply({ content: `\`\`\`전송을 실패하였습니다\`\`\`` })
                                    })
                            else
                            {
                                logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, fail`)
                                await interaction.editReply({ content: `\`\`\`잔액이 부족합니다\`\`\`` })
                            }
                        else
                        {
                            logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, fail`)
                            await interaction.editReply({ content: `\`\`\`잔액이 부족합니다\`\`\`` })
                        }
                    }
                    else
                    {
                        logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, fail`)
                        await interaction.editReply({ content: `\`\`\`존재하지 않는 종목입니다\`\`\`` })
                    }
                }
                else
                {
                    logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, fail`)
                    await interaction.editReply({ content: `\`\`\`존재하지 않는 유저 입니다\`\`\`` })
                }
            }
            else
            {
                logger.info(`${interaction.user.id} - 전송 대상:${id} 종목:${symbol} 수량:${value}, fail`)
                await interaction.editReply({ content: `\`\`\`수량은 양수여야 합니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 전송, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}