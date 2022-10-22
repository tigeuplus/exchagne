import { CommandInteraction, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Transaction, User } from '../../Type/Exchange'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('거래수정')
        .setDescription('거래를 수정합니다')
        .addNumberOption((option: SlashCommandNumberOption): SlashCommandNumberOption =>
            option
                .setName('번호')
                .setDescription('수정할 거래 번호')
                .setRequired(true))
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('수량')
                .setDescription('수정할 수량'))
        .addStringOption((option: SlashCommandStringOption): SlashCommandStringOption =>
            option
                .setName('가격')
                .setDescription('수정할 가격')),
    async execute(interaction: CommandInteraction, exchange: PoolConnection): Promise<void>
    {
        let user: User | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
        if (user)
        {
            let idx: number = Number(interaction.options.get('번호', true).value)
            let value: number | undefined
            if (interaction.options.get('수량'))
                value = (Number(interaction.options.get('수량')!.value) * 100000000)
                
            let price: number | undefined
            if (interaction.options.get('가격'))
                price = (Number(interaction.options.get('가격')!.value) * 100000000)

            if (!value && !price)
            {
                logger.info(`${interaction.user.id} - 거래수정, fail`)
                await interaction.editReply({ content: `\`\`\`수량이나 가격을 입력해야 합니다\`\`\`` })
            }
            else
            {
                if ((!value || (value && Math.sign(value) > 0)) && (!price || (price && Math.sign(price) > 0)))
                {
                    let transaction: Transaction | undefined = JSON.parse(JSON.stringify(await exchange.query(`SELECT * FROM transactions WHERE idx = ${idx}`)))[0][0]
                    if (transaction)
                        if (transaction.id === interaction.user.id)
                        {
                            if (value)
                            {
                                if (transaction.process <= value)
                                    exchange.query(`UPDATE transactions SET value = ${value ? value : transaction.value}, price = ${price ? price : transaction.price} WHERE idx = ${idx}`)
                                        .then(async (): Promise<void> =>
                                        {
                                            logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, success`)
                                            await interaction.editReply({ content: `\`\`\`거래수정이 완료되었습니다\`\`\`` })
                                        })
                                        .catch(async (error: any): Promise<void> =>
                                        {
                                            exchange.rollback()
                                            
                                            logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                                            await interaction.editReply({ content: `\`\`\`거래수정을 실패하였습니다\`\`\`` })
                                        })
                                else
                                {
                                    logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                                    await interaction.editReply({ content: `\`\`\`수정할 수량이 처리되지 않은 수량보다 적습니다\`\`\`` })
                                }
                            }
                            else
                                exchange.query(`UPDATE transactions SET value = ${value ? value : transaction.value}, price = ${price ? price : transaction.price} WHERE idx = ${idx}`)
                                    .then(async (): Promise<void> =>
                                    {
                                        logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, success`)
                                        await interaction.editReply({ content: `\`\`\`거래수정이 완료되었습니다\`\`\`` })
                                    })
                                    .catch(async (error: any): Promise<void> =>
                                    {
                                        exchange.rollback()

                                        logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                                        await interaction.editReply({ content: `\`\`\`거래수정을 실패하였습니다\`\`\`` })
                                    })
                        }
                        else
                        {
                            logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                            await interaction.editReply({ content: `\`\`\`자신의 거래가 아닙니다\`\`\`` })
                        }
                    else
                    {
                        logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                        await interaction.editReply({ content: `\`\`\`존재하지 않는 거래입니다\`\`\`` })
                    }
                }
                else
                {
                    
                    logger.info(`${interaction.user.id} - 거래수정 번호:${idx} ${value ? ` 수량:${value}` : ``} ${price ? ` 가격:${price}` : ``}, fail`)
                    await interaction.editReply({ content: `\`\`\`수량이나 가격은 양수여야 합니다\`\`\`` })
                }
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 거래수정, fail`)
            await interaction.editReply({ content: `\`\`\`회원가입이 되어 있지 않습니다\`\`\`` })
        }
    }
}