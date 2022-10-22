import { Interaction } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { Coin, Transaction, User, Price } from '../../Type/Exchange'

export async function transaction(interaction: Interaction, exchange: PoolConnection): Promise<void>
{
    let coins: Coin[] | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM coins`)))[0]
    if (coins)
        for (let a: number = 0; a < coins.length; a ++)
        {
            let price: Price | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM prices WHERE symbol = '${coins[a].symbol}'`)))[0][0]
            if (price)
            {
                let buyTransactions: Transaction[] | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM transactions WHERE symbol = '${coins[a].symbol}' AND type = 'buy'`)))[0]
                if (buyTransactions)
                    for (let b: number = 0; b < buyTransactions.length; b ++)
                    {
                        let buyTransaction: Transaction = buyTransactions[b]
                        let buyer: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${buyTransaction.id}'`)))[0][0]
                        if (buyer)
                        {
                            let buyerBalance: number | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${buyer.id}', 'TGX') AS balance`)))[0][0]?.balance
                            if (buyerBalance)
                            {
                                let sellTransactions: Transaction[] | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM transactions WHERE symbol = '${coins[a].symbol}' AND type = 'sell' AND price = ${buyTransactions[b].price}`)))[0]
                                if (sellTransactions)
                                    for (let c: number = 0; c < sellTransactions.length; c ++)
                                    {
                                        let sellTransaction: Transaction = sellTransactions[c]
                                        let buyTransactionUnprocess: number = buyTransaction.value - buyTransaction.process
                                        let sellTransactionUnprocess: number = sellTransaction.value - sellTransaction.process
                                        if (buyTransactionUnprocess === 0)
                                        {
                                            await exchange.query(`DELETE FROM transactions WHERE idx = ${buyTransaction.idx}`)
                                            await (await interaction.client.users.fetch(buyTransaction.id)).send({ content: `\`\`\`거래 ${buyTransaction.idx}번이 체결되었습니다\`\`\`` })

                                            break
                                        }
    
                                        let seller: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${sellTransaction.id}'`)))[0][0]
                                        if (seller)
                                            if (buyer.id !== seller.id)
                                            {
                                                let sellerBalance: number | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT getBalance('${seller.id}', '${sellTransaction.symbol}') AS balance`)))[0][0]?.balance
                                                if (sellerBalance)
                                                    if (buyerBalance >= ((buyTransactionUnprocess / 100000000) * (buyTransaction.price)))
                                                        if (sellerBalance >= sellTransactionUnprocess)
                                                            if (sellTransactionUnprocess === 0)
                                                                await exchange.query(`DELETE FROM transactions WHERE idx = ${sellTransaction.idx}`)
                                                            else 
                                                            {
                                                                buyTransaction.process += (buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess)
                                                                sellTransaction.process += (buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess)
                                                            
                                                                await exchange.query(`UPDATE transactions SET process = ${buyTransaction.process} WHERE idx = ${buyTransaction.idx}`)
                                                                await exchange.query(`UPDATE transactions SET process = ${sellTransaction.process} WHERE idx = ${sellTransaction.idx}`)
    
                                                                await exchange.query(`INSERT INTO histories (receiver, sender, symbol, value, memo) VALUES ('${buyer.id}', '${seller.id}', '${buyTransaction.symbol}', ${buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess}, '${buyTransaction.symbol} 매수 - 수량:${(buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess) / 100000000} 가격:${buyTransaction.price / 100000000}')`)
                                                                await exchange.query(`INSERT INTO histories (receiver, sender, symbol, value, memo) VALUES ('${seller.id}', '${buyer.id}', 'TGX', ${((buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess) / 100000000) * buyTransaction.price}, '${buyTransaction.symbol} 매도 - 수량:${(buyTransactionUnprocess >= sellTransactionUnprocess ? sellTransactionUnprocess : buyTransactionUnprocess) / 100000000} 가격:${(buyTransaction.price) / 100000000}')`)
        
                                                                price = { symbol: price.symbol, open: buyTransaction.price, high: ((buyTransaction.price >= price.high) ? buyTransaction.price : price.high), low: ((buyTransaction.price >= price.low) ? price.low : buyTransaction.price), close: price.close }
                                                                await exchange.query(`UPDATE prices SET open = ${price.open}, high = ${price.high}, low = ${price.low}, close = ${price.close} WHERE symbol = '${price.symbol}'`)
    
                                                                if (buyTransaction.process === buyTransaction.value)
                                                                {
                                                                    await exchange.query(`DELETE FROM transactions WHERE idx = ${buyTransaction.idx}`)
                                                                    await (await interaction.client.users.fetch(buyTransaction.id)).send({ content: `\`\`\`거래 ${buyTransaction.idx}번이 체결되었습니다\`\`\`` })

                                                                    break
                                                                }
    
                                                                if (sellTransaction.process === sellTransaction.value)
                                                                {
                                                                    await exchange.query(`DELETE FROM transactions WHERE idx = ${sellTransaction.idx}`)
                                                                    await (await interaction.client.users.fetch(sellTransaction.id)).send({ content: `\`\`\`거래 ${sellTransaction.idx}번이 체결되었습니다\`\`\`` })
                                                                }
                                                            }
                                                        else
                                                        {
                                                            await exchange.query(`DELETE FROM transactions WHERE idx = ${sellTransaction.idx}`)
                                                            await (await interaction.client.users.fetch(sellTransaction.id)).send({ content: `\`\`\`거래 ${sellTransaction.idx}번이 체결되었습니다\`\`\`` })
                                                        }
                                                    else
                                                    {
                                                        await exchange.query(`DELETE FROM transactions WHERE idx = ${buyTransaction.idx}`)
                                                        await (await interaction.client.users.fetch(buyTransaction.id)).send({ content: `\`\`\`거래 ${buyTransaction.idx}번이 체결되었습니다\`\`\`` })

                                                        break
                                                    }
                                            }
                                    }
                            }
                        }
                    }
            }
        }
}