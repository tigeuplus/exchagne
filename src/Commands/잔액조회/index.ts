import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Price, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('잔액조회')
        .setDescription('내 잔액을 조회합니다')
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('종목')
                .setDescription('잔액 조회 종목')),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let symbol: string | undefined
            if (interaction.options.get('종목'))
                symbol = String(interaction.options.get('종목', true).value!).toUpperCase()

            if (symbol)
                if (symbol === 'TGX')
                {
                    let balance: number = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', '${symbol}') AS balance`)))[0][0]?.balance
                    
                    logger.info(`${interaction.user.id} - 잔액조회 종목:${symbol}, success`)
                    await interaction.editReply({ content: `\`\`\`[ 잔액조회 ${symbol} ] - ${balance / 100000000} ${symbol}\`\`\`` })
                }
                else
                {
                    let price: Price | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM prices WHERE symbol = '${symbol}'`)))[0][0]
                    if (price)
                    {
                        let balance: number = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', '${symbol}') AS balance`)))[0][0]?.balance
                        
                        logger.info(`${interaction.user.id} - 잔액조회 종목:${symbol}, success`)
                        await interaction.editReply({ content: `\`\`\`[ 잔액조회 ${symbol} ] - ${balance / 100000000} ${symbol} (가치: ${((balance / 100000000) * price.open) / 100000000} TGX)\`\`\`` })
                    }
                    else
                    {
                        logger.info(`${interaction.user.id} - 잔액조회 종목:${symbol}, fail`)
                        await interaction.editReply({ content: `\`\`\`존재하지 않는 종목 입니다\`\`\`` })
                    }
                }
            else
            {
                let prices: Price[] | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM prices WHERE symbol != 'TGX'`)))[0]
                if (prices)
                {
                    let TGX: number = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', 'TGX') AS balance`)))[0][0]?.balance
                    let message: string = `\`\`\`[ 잔액조회 ]\nTGX: ${TGX / 100000000} TGX\n\n`
                    for (let n: number = 0; n < prices.length; n ++)
                    {
                        let balance: number = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${interaction.user.id}', '${prices[n].symbol}') AS balance`)))[0][0]?.balance
                        message += `${prices[n].symbol}: ${balance / 100000000} ${prices[n].symbol} (가치: ${((balance / 100000000) * prices[n].open) / 100000000} TGX)\n`
                    }

                    logger.info(`${interaction.user.id} - 잔액조회, success`)
                    await interaction.editReply({ content: `${message}\`\`\`` })
                }
                else
                {
                    logger.info(`${interaction.user.id} - 잔액조회, fail`)
                    await interaction.editReply({ content: `\`\`\`종목이 존재하지 않습니다\`\`\`` })
                }
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 잔액조회, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}