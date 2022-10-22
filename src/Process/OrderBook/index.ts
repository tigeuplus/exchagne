import { Pool, PoolConnection } from 'mysql2/promise'
import { Price, Transaction } from '../../Type/Exchange'

export async function orderBook(exchange: PoolConnection, symbol: string): Promise<string | undefined>
{
    let price: Price | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM prices WHERE symbol = '${symbol}'`)))[0][0]
    if (price)
    {
        let transactions: Transaction[] = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM transactions WHERE symbol = '${symbol}'`)))[0]
        let prices: { buy: { [ index: string ]: number }, sell: { [ index: string ]: number } } = { buy: {}, sell: {} }
        for (let n: number = 0; n < transactions.length; n ++)
            if (prices[transactions[n].type][transactions[n].price])
                prices[transactions[n].type][transactions[n].price] += transactions[n].value
            else
                prices[transactions[n].type][transactions[n].price] = transactions[n].value

        let key_prices: { buy: string[], sell: string[] } = { buy: Object.keys(prices.buy).sort((a: string, b: string) => Number(b) - Number(a)), sell: Object.keys(prices.sell).sort((a: string, b: string) => Number(a) - Number(b)) }
        let message: [ string, string ] = [ '', '' ]
        
        for (let n: number = 9; n >= 0; n --)
            message[0] += `\n[0;32m\u2503\u3000${key_prices.buy[n] ? `${Number(key_prices.buy[n]) / 100000000}\u3000឵\u2503\u3000${prices.buy[key_prices.buy[n]] / 100000000}` : '*឵\u3000឵\u2503\u3000*'}\u3000឵\u2503[0m`

        for (let n: number = 0; n <= 9; n ++)
            message[1] += `\n[0;31m\u2503\u3000${key_prices.sell[n] ? `${Number(key_prices.sell[n]) / 100000000}\u3000឵\u2503\u3000${prices.sell[key_prices.sell[n]] / 100000000}` : '*឵\u3000឵\u2503\u3000*'}\u3000឵\u2503[0m`

        let change: number = (((price.open / price.close) * 100) - 100)
        return `\`\`\`ansi\n[1m${symbol} - [${Math.sign(change) === 0 ? '1' : Math.sign(change) === 1 ? '32' : '31'}m${price.open / 100000000} TGX (${Math.sign(price.open - price.close) > 0 ? `+` : ``}${(price.open - price.close) / 100000000} TGX / ${Math.sign(change) > 0 ? `+` : ``}${change}%)[0m\n\u3000고가 ${price.high / 100000000} TGX\n\u3000저가 ${price.low / 100000000} TGX\n\u3000전일종가 ${price.close / 100000000} TGX\n${message[0]}\n\u2503\u3000${price.open / 100000000}\u3000឵\u2503${message[1]}\`\`\``
    }
}