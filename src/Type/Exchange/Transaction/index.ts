export type Transaction = {
    idx: number
    id: string
    value: number
    symbol: string
    type: 'buy' | 'sell'
    process: number
    price: number
    created: string
}