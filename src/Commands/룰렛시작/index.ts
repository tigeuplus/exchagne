import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js'
import { PoolConnection } from 'mysql2/promise'
import { logger } from '../../Logger'
import { Betting, Channel, User } from '../../Type/Roulette'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('룰렛시작')
        .setDescription('룰렛을 시작합니다'),
    async execute(interaction: CommandInteraction, exchange: PoolConnection, roulette: PoolConnection): Promise<void>
    {
        let channel: Channel | undefined = JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM channels WHERE id = '${interaction.channel!.id}' `)))[0][0]
        if (channel)
        {
            let user: User | undefined = JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM users WHERE id = '${interaction.user.id}'`)))[0][0]
            if (user)
                if (user.channel === channel.id)
                {
                    await roulette.query(`UPDATE channels SET status = 'betting' WHERE id = '${interaction.channel!.id}'`)
                    let num: string[] = 
                    [
                        '[32m００[0m',
                        '[31m２７[0m',
                        '[30m１０[0m',
                        '[31m２５[0m',
                        '[30m２９[0m',
                        '[31m１２[0m',
                        '[30m０８[0m',
                        '[31m１９[0m',
                        '[30m３１[0m',
                        '[31m１８[0m',
                        '[30m０６[0m',
                        '[31m２１[0m',
                        '[30m３３[0m',
                        '[31m１６[0m',
                        '[30m０４[0m',
                        '[31m２３[0m',
                        '[30m３５[0m',
                        '[31m１４[0m',
                        '[30m０２[0m',
                        '[32m឵　０[0m',
                        '[30m２８[0m',
                        '[31m０９[0m',
                        '[30m２６[0m',
                        '[31m３０[0m',
                        '[30m１１[0m',
                        '[31m０７[0m',
                        '[30m２０[0m',
                        '[31m３２[0m',
                        '[30m１７[0m',
                        '[31m０５[0m',
                        '[30m２２[0m',
                        '[31m３４[0m',
                        '[30m１５[0m',
                        '[31m０３[0m',
                        '[30m２４[0m',
                        '[31m３６[0m',
                        '[30m１３[0m',
                        '[31m０１[0m'
                    ]

                    let board: Message = await interaction.channel!.send({ content: calculateBoard([]) })
                    await roulette.query(`INSERT INTO messages (id, channel) VALUES ('${board.id}', '${interaction.channel!.id}')`)

                    let message: Message = await interaction.channel!.send({ content:  `\`\`\`anis\n${num[0]}\n\`\`\`` })
                    interaction.channel!.send({ content: `\`\`\`10초 후에 룰렛이 돌아갑니다.\`\`\`` })
                        .then(async (msg: Message<boolean>) =>
                        {
                            await delay(9000)
                            msg.delete()
                        })
    
                    await delay(10000)
    
                    let current: number = 0
                    let previous: number = 0
                    for (let j: number = 1; j <= 5; j ++)
                    {
                        if (j === 3)
                            await roulette.query(`UPDATE channels SET status = 'stop' WHERE id = '${interaction.channel!.id}'`)

                        previous = current
                        current = Math.floor(Math.random() * num.length)

                        await delay(j * 160)
                        await message.edit({ content: `\`\`\`anis\n${num[0]}\n\`\`\`` })
                    }

                    let target: string = num[current].replace('4;', '').replace('[30m', '').replace('[31m', '').replace('[32m', '').replace('[0m', '')
                    let bettings: Betting[] = JSON.parse(JSON.stringify(await roulette.query(`SELECT * FROM bettings WHERE channel = '${interaction.channel!.id}'`)))[0]
                    let content: string = '\`\`\`ansi'
                        + `\n`
                        + `${num[current]}`
                        + `\n`
                        + `\n`

                    for (let i: number = 0; i < bettings.length; i ++)
                    {
                        let numbers: string[] = calculateNumbers(bettings[i].x, bettings[i].y)
                        if (numbers.find((s: string) => s === target))
                            switch (numbers.length)
                            {
                                case 1:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 35 / 100000000}[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 35}, 'GAMB', '룰렛')`)
                                    break

                                case 2:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 17 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 17}, 'GAMB', '룰렛')`)
                                    break

                                case 3:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 11 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 11}, 'GAMB', '룰렛')`)
                                    break

                                case 4:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 8 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 8}, 'GAMB', '룰렛')`)
                                    break

                                case 5:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 6 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 5}, 'GAMB', '룰렛')`)
                                    break

                                case 6:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 5 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 2}, 'GAMB', '룰렛')`)
                                    break

                                case 12:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 2 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 1}, 'GAMB', '룰렛')`)
                                    break

                                case 18:
                                    content += `${bettings[i].name}:  [32m+ ${bettings[i].value * 1 / 100000000} GAMB[0m`
                                        + '\n'

                                    await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('${bettings[i].id}', 'admin', ${bettings[i].value * 1}, 'GAMB', '룰렛')`)
                                    break
                            }
                        else
                        {
                            content += `${bettings[i].name}:  [31m- ${bettings[i].value / 100000000} GAMB[0m`
                                + '\n'

                            await exchange.query(`INSERT INTO histories (receiver, sender, value, symbol, memo) VALUES ('admin', '${bettings[i].id}', ${bettings[i].value}, 'GAMB', '룰렛')`)
                        }
                    }

                    await roulette.query(`DELETE FROM bettings WHERE channel = '${interaction.channel!.id}'`)

                    await board.edit({ content: calculateBoard([]) })
                    await message.edit({ content: `${content}\`\`\`` })

                    await delay(5000)

                    await board.delete()
                    await message.delete()

                    await roulette.query(`UPDATE channels SET status = 'stop' WHERE id = '${interaction.channel!.id}'`)
                    await roulette.query(`DELETE FROM messages WHERE channel = '${interaction.channel!.id}'`)
    
                    logger.info(`${interaction.user.id} - 룰렛시작, success`)
                }
                else
                {
                    logger.info(`${interaction.user.id} - 룰렛시작, fail`)
                    await interaction.editReply({ content: `\`\`\`룰렛에 참가하지 않았습니다\`\`\`` })
                }
            else
            {
                logger.info(`${interaction.user.id} - 룰렛시작, fail`)
                await interaction.editReply({ content: `\`\`\`룰렛에 참가하지 않습니다\`\`\`` })
            }
        }
        else
        {
            logger.info(`${interaction.user.id} - 룰렛시작, fail`)
            await interaction.editReply({ content: `\`\`\`올바른 채널이 아닙니다\`\`\`` })
        }
    }
}

function calculateBoard(bettings: Betting[]): string
{
    let board: string = `\`\`\`ansi`
        + `\n`
        + `　　　　ＡＢ　ＣＤ　ＥＦ　ＧＨ　ＩＪ　ＫＬ　ＭＮ　ＯＰ　ＱＲ　ＳＴ　ＵＶ　ＷＸ　ＹＺ　０\n`
        + `０　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n`
        + `１　　００　[31m０３[0m　[30m０６[0m　[31m[0m[31m０９　１２[0m[31m[0m　[30m１５[0m　[31m[0m[31m１８　２１[0m[31m[0m　[30m２４[0m　[31m[0m[31m２７　３０[0m[31m[0m　[30m３３[0m　[31m[31m３６[0m[31m[0m　Ｃ３\n`
        + `２　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n`
        + `３　　　　　[30m０２[0m　[31m０５[0m　[30m０８　１１[0m　[31m１４[0m　[30m１７　２０[0m　[31m２３[0m　[31m[30m２６　２９[0m[31m[0m　[31m３２[0m　[30m３５[0m　Ｃ２\n`
        + `４　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n`
        + `５　　０　[31m０１[0m　[30m０４[0m　[31m０７[0m　[30m１０　１３[0m　[31m１６　１９[0m　[30m２２[0m　[31m２５[0m　[30m２８[0m　[30m３１[0m　[31m３４[0m　Ｃ１\n`
        + `６　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n`
        + `７　　　　　　　１ｓｔ　１２　　　　　　２ｎｄ　１２　　　　　３ｒｄ　１２　　　　　　　\n`
        + `８　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n`
        + `９　　　　　１－１８　　Ｅｖｅｎ　　[31m█████████[0m[30m█████████[0m　　Ｏｄｄ　１９－３６　　　\n\n\n`

    for (let i: number = 0; i < bettings.length; i++)
    {
        let numbers: string[] = calculateNumbers(bettings[i].x, bettings[i].y)
        switch (numbers.length)
        {
            case 1:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (1개 베팅, 35배)\n`
                break

            case 2:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (2개 베팅, 17배)\n`
                break

            case 3:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (3개 베팅, 11배)\n`
                break

            case 4:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (4개 베팅, 8배)\n`
                break

            case 5:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (5개 베팅, 6배)\n`
                break

            case 6:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (6개 베팅, 5배)\n`
                break

            case 12:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (12개 베팅, 2배)\n`
                break

            case 18:
                board += `${bettings[i].name}: ${bettings[i].value / 100000000} (18개 베팅, 1배)\n`
                break
        }
    }

    return `${board}\`\`\``
}

function delay(ms: number): Promise<undefined>
{
    return new Promise((resolve: any, reject: any) =>
    {
        setTimeout(resolve, ms)
    })
}

function calculateNumbers(x: string, y: string): string[]
{
    let numbers: string[] = []
    switch (x)
    {
        case 'A':
            switch (y)
            {
                case '1':
                    numbers.push('００')
                    break
                
                case '2':
                    numbers.push('００')
                    break
    
                case '3':
                    numbers.push('０', '００')
                    break
    
                case '4':
                    numbers.push('０')
                    break
    
                case '5':
                    numbers.push('０')
                    break
            }
    
            break
    
        case 'B':
            switch (y)
            {
                case '0':
                    numbers.push('０', '００', '０１', '０２', '０３')
                    break
    
                case '1':
                    numbers.push('００', '０３')
                    break
    
                case '2':
                    numbers.push('００', '０２', '０３')
                    break
    
                case '3':
                    numbers.push('０', '００', '０２')
                    break
    
                case '4':
                    numbers.push('００', '０１', '０２')
                    break
    
                case '5':
                    numbers.push('０', '０１')
                    break
            }
    
        case 'C':
            switch (y)
            {
                case '0':
                    numbers.push('０１', '０２', '０３')
                    break
    
                case '1':
                    numbers.push('０３')
                    break
                
                case '2':
                    numbers.push('０２', '０３')
                    break
    
                case '3':
                    numbers.push('０２')
                    break
    
                case '4':
                    numbers.push('０１', '０２')
                    break
    
                case '5':
                    numbers.push('０１')
                    break
    
                case '9':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２', '１３', '１４', '１５', '１６', '１７', '１８')
                    break
            }
    
            break
    
        case 'D':
            switch (y)
            {
                case '0':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６')
                    break
    
                case '1':
                    numbers.push('０３', '０６')
                    break
                
                case '2':
                    numbers.push('０２', '０３', '０５', '０６')
                    break
    
                case '3':
                    numbers.push('０２', '０５')
                    break
    
                case '4':
                    numbers.push('０１', '０２', '０４', '０５')
                    break
    
                case '5':
                    numbers.push('０１', '０４')
                    break
    
                case '7':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２')
                    break
    
                case '9':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２', '１３', '１４', '１５', '１６', '１７', '１８')
                    break
            }
    
            break
    
        case 'E':
            switch (y)
            {
                case '0':
                    numbers.push('０４', '０５', '０６')
                    break
    
                case '1':
                    numbers.push('０６')
                    break
                
                case '2':
                    numbers.push('０５', '０６')
                    break
    
                case '3':
                    numbers.push('０５')
                    break
    
                case '4':
                    numbers.push('０４', '０５')
                    break
    
                case '5':
                    numbers.push('０４')
                    break
    
                case '7':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２')
                    break
    
                case '9':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２', '１３', '１４', '１５', '１６', '１７', '１８')
                    
                    break
            }
    
            break
    
        case 'F':
            switch (y)
            {
                case '0':
                    numbers.push('０４', '０５', '０６', '０７', '０８', '０９')
                    break
    
                case '1':
                    numbers.push('０６', '０９')
                    break
                
                case '2':
                    numbers.push('０５', '０６', '０８', '０９')
                    break
    
                case '3':
                    numbers.push('０５', '０８')
                    break
    
                case '4':
                    numbers.push('０４', '０５', '０７', '０８')
                    break
    
                case '5':
                    numbers.push('０４', '０７')
                    break
    
                case '7':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２')
                    break
            }
    
            break
    
        case 'G':
            switch (y)
            {
                case '0':
                    numbers.push('０７', '０８', '０９')
                    break
    
                case '1':
                    numbers.push('０９')
                    break
                
                case '2':
                    numbers.push('０８', '０９')
                    break
    
                case '3':
                    numbers.push('０８')
                    break
    
                case '4':
                    numbers.push('０７', '０８')
                    break
    
                case '5':
                    numbers.push('０７')
                    break
    
                case '7':
                    numbers.push('０１', '０２', '０３', '０４', '０５', '０６', '０７', '０８', '０９', '１０', '１１', '１２')
                    break
    
                case '9':
                    numbers.push('０２', '０４', '０６', '０８', '１０', '１２', '１４', '１６', '１８', '２０', '２２', '２４', '２６', '２８', '３０', '３２', '３４', '３６', '３８')
                    break
            }
    
            break
    
        case 'H':
            switch (y)
            {
                case '0':
                    numbers.push('０７', '０８', '０９', '１０', '１１', '１２')
                    break
    
                case '1':
                    numbers.push('０９', '１２')
                    break
                
                case '2':
                    numbers.push('０８', '０９', '１１', '１２')
                    break
    
                case '3':
                    numbers.push('０８', '１１')
                    break
    
                case '4':
                    numbers.push('０７', '０８', '１０', '１１')
                    break
    
                case '5':
                    numbers.push('０７', '１０')
                    break
    
                case '9':
                    numbers.push('０２', '０４', '０６', '０８', '１０', '１２', '１４', '１６', '１８', '２０', '２２', '２４', '２６', '２８', '３０', '３２', '３４', '３６', '３８')
                    break
            }
    
            break
    
        case 'I':
            switch (y)
            {
                case '0':
                    numbers.push('１０', '１１', '１２')
                    break
    
                case '1':
                    numbers.push('１２')
                    break
                
                case '2':
                    numbers.push('１１', '１２')
                    break
    
                case '3':
                    numbers.push('１１')
                    break
    
                case '4':
                    numbers.push('１０', '１１')
                    break
    
                case '5':
                    numbers.push('１０')
                    break
            }
    
            break
    
        case 'J':
            switch (y)
            {
                case '0':
                    numbers.push('１０', '１１', '１２', '１３', '１４', '１５')
                    break
    
                case '1':
                    numbers.push('１２', '１５')
                    break
                
                case '2':
                    numbers.push('１１', '１２', '１４', '１５')
                    break
    
                case '3':
                    numbers.push('１１', '１４')
                    break
    
                case '4':
                    numbers.push('１０', '１１', '１３', '１４')
                    break
    
                case '5':
                    numbers.push('１０', '１３')
                    break
            }
    
            break
    
        case 'K':
            switch (y)
            {
                case '0':
                    numbers.push('１３', '１４', '１５')
                    break
    
                case '1':
                    numbers.push('１５')
                    break
                
                case '2':
                    numbers.push('１４', '１５')
                    break
    
                case '3':
                    numbers.push('１４')
                    break
    
                case '4':
                    numbers.push('１３', '１４')
                    break
    
                case '5':
                    numbers.push('１３')
                    break
    
                case '9':
                    numbers.push('０１', '０３', '０５', '０７', '０９', '１２', '１４', '１６', '１８', '１９', '２１', '２３', '２５', '２７', '３０', '３２', '３４', '３６')
                    break
            }
    
            break
    
        case 'L':
            switch (y)
            {
                case '0':
                    numbers.push('１３', '１４', '１５', '１６', '１７', '１８')
                    break
    
                case '1':
                    numbers.push('１５', '１８')
                    break
                
                case '2':
                    numbers.push('１４', '１５', '１７', '１８')
                    break
    
                case '3':
                    numbers.push('１４', '１７')
                    break
    
                case '4':
                    numbers.push('１３', '１４', '１６', '１７')
                    break
    
                case '5':
                    numbers.push('１３', '１６')
                    break
    
                case '7':
                    numbers.push('１３', '１４', '１５', '１６', '１７', '１８', '１９', '２０', '２１', '２２', '２３', '２４')
                    break
    
                case '9':
                    numbers.push('０１', '０３', '０５', '０７', '０９', '１２', '１４', '１６', '１８', '１９', '２１', '２３', '２５', '２７', '３０', '３２', '３４', '３６')
                    break
            }
    
            break
    
        case 'M':
            switch (y)
            {
                case '0':
                    numbers.push('１６', '１７', '１８')
                    break
    
                case '1':
                    numbers.push('１８')
                    break
                
                case '2':
                    numbers.push('１７', '１８')
                    break
    
                case '3':
                    numbers.push('１７')
                    break
    
                case '4':
                    numbers.push('１６', '１７')
                    break
    
                case '5':
                    numbers.push('１６')
                    break
    
                case '7':
                    numbers.push('１３', '１４', '１５', '１６', '１７', '１８', '１９', '２０', '２１', '２２', '２３', '２４')
                    break
    
                case '9':
                    numbers.push('０１', '０３', '０５', '０７', '０９', '１２', '１４', '１６', '１８', '１９', '２１', '２３', '２５', '２７', '３０', '３２', '３４', '３６')
                    break
            }
    
            break
    
        case 'N':
            switch (y)
            {
                case '0':
                    numbers.push('１６', '１７', '１８', '１９', '２０', '２１')
                    break
    
                case '1':
                    numbers.push('１８', '２１')
                    break
                
                case '2':
                    numbers.push('１７', '１８', '２０', '２１')
                    break
    
                case '3':
                    numbers.push('１７', '２０')
                    break
    
                case '4':
                    numbers.push('１６', '１７', '１９', '２０')
                    break
    
                case '5':
                    numbers.push('１６', '１９')
                    break
    
                case '7':
                    numbers.push('１３', '１４', '１５', '１６', '１７', '１８', '１９', '２０', '２１', '２２', '２３', '２４')
                    break
    
                case '9':
                    numbers.push('０２', '０４', '０６', '０８', '１０', '１１', '１３', '１５', '１７', '２０', '２２', '２４', '２６', '２８', '２９', '３３', '３５')
                    break
            }
    
            break
    
        case 'O':
            switch (y)
            {
                case '0':
                    numbers.push('１９', '２０', '２１')
                    break
    
                case '1':
                    numbers.push('２１')
                    break
                
                case '2':
                    numbers.push('２０', '２１')
                    break
    
                case '3':
                    numbers.push('２０')
                    break
    
                case '4':
                    numbers.push('１９', '２０')
                    break
    
                case '5':
                    numbers.push('０２', '０４', '０６', '０８', '１０', '１１', '１３', '１５', '１７', '２０', '２２', '２４', '２６', '２８', '２９', '３３', '３５')
                    break
    
                case '7':
                    numbers.push('１３', '１４', '１５', '１６', '１７', '１８', '１９', '２０', '２１', '２２', '２３', '２４')
                    break
            }
    
            break
    
        case 'P':
            switch (y)
            {
                case '0':
                    numbers.push('１９', '２０', '２１', '２２', '２３', '２４')
                    break
    
                case '1':
                    numbers.push('２１', '２４')
                    break
                
                case '2':
                    numbers.push('２０', '２１', '２３', '２４')
                    break
    
                case '3':
                    numbers.push('２０', '２３')
                    break
    
                case '4':
                    numbers.push('１９', '２０', '２２', '２３')
                    break
    
                case '5':
                    numbers.push('１９', '２２')
                    break
    
                case '9':
                    numbers.push('０２', '０４', '０６', '０８', '１０', '１１', '１３', '１５', '１７', '２０', '２２', '２４', '２６', '２８', '２９', '３３', '３５')
                    break
            }
    
            break
    
        case 'Q':
            switch (y)
            {
                case '0':
                    numbers.push('２２', '２３', '２４')
                    break
    
                case '1':
                    numbers.push('２４')
                    break
                
                case '2':
                    numbers.push('２３', '２４')
                    break
    
                case '3':
                    numbers.push('２３')
                    break
    
                case '4':
                    numbers.push('２２', '２３')
                    break
    
                case '5':
                    numbers.push('２２')
                    break
            }
    
            break
    
        case 'R':
            switch (y)
            {
                case '0':
                    numbers.push('２２', '２３', '２４', '２５', '２６', '２７')
                    break
    
                case '1':
                    numbers.push('２４', '２７')
                    break
                
                case '2':
                    numbers.push('２３', '２４', '２６', '２７')
                    break
    
                case '3':
                    numbers.push('２３', '２６')
                    break
    
                case '4':
                    numbers.push('２２', '２３', '２５', '２６')
                    break
    
                case '5':
                    numbers.push('２２', '２５')
                    break
            }
    
            break
    
        case 'S':
            switch (y)
            {
                case '0':
                    numbers.push('２５', '２６', '２７')
                    break
    
                case '1':
                    numbers.push('２７')
                    break
                
                case '2':
                    numbers.push('２６', '２７')
                    break
    
                case '3':
                    numbers.push('２６')
                    break
    
                case '4':
                    numbers.push('２５', '２６')
                    break
    
                case '5':
                    numbers.push('２５')
                    break
    
                case '7':
                    numbers.push('２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
    
                break
    
                case '9':
                    numbers.push('０１', '０３', '０５', '０７', '０９', '１１', '１３', '１５', '１７', '１９', '２１', '２３', '２５', '２７', '２９', '３１', '３３', '３５')
                    break
            }
    
            break
    
        case 'T':
            switch (y)
            {
                case '0':
                    numbers.push('２５', '２６', '２７', '２８', '２９', '３０')
                    break
    
                case '1':
                    numbers.push('２７', '３０')
                    break
                
                case '2':
                    numbers.push('２６', '２７', '２９', '３０')
                    break
    
                case '3':
                    numbers.push('２６', '２９')
                    break
    
                case '4':
                    numbers.push('２５', '２６', '２８', '２９')
                    break
    
                case '5':
                    numbers.push('２５', '２８')
                    break
    
                case '7':
                    numbers.push('２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                break
    
                case '9':
                    numbers.push('０１', '０３', '０５', '０７', '０９', '１１', '１３', '１５', '１７', '１９', '２１', '２３', '２５', '２７', '２９', '３１', '３３', '３５')
                    break
            }
    
            break
    
        case 'U':
            switch (y)
            {
                case '0':
                    numbers.push('２８', '２９', '３０')
                    break
    
                case '1':
                    numbers.push('３０')
                    break
                
                case '2':
                    numbers.push('２９', '３０')
                    break
    
                case '3':
                    numbers.push('２９')
                    break
    
                case '4':
                    numbers.push('２８', '２９')
                    break
    
                case '5':
                    numbers.push('２８')
                    break
    
                case '7':
                    numbers.push('２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                    break
            }
    
            break
    
        case 'V':
            switch (y)
            {
                case '0':
                    numbers.push('２８', '２９', '３０', '３１', '３２', '３３')
                    break
    
                case '1':
                    numbers.push('３０', '３３')
                    break
                
                case '2':
                    numbers.push('２９', '３０', '３２', '３３')
                    break
    
                case '3':
                    numbers.push('２９', '３２')
                    break
    
                case '4':
                    numbers.push('２８', '２９', '３１', '３２')
                    break
    
                case '5':
                    numbers.push('２８', '３１')
                    break
    
                case '7':
                    numbers.push('２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                    break
    
                case '9':
                    numbers.push('１９', '２０', '２１', '２２', '２３', '２４', '２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                    break
            }
    
            break
    
        case 'W':
            switch (y)
            {
                case '0':
                    numbers.push('３１', '３２', '３３')
                    break
    
                case '1':
                    numbers.push('３３')
                    break
                
                case '2':
                    numbers.push('３２', '３３')
                    break
    
                case '3':
                    numbers.push('３２')
                    break
    
                case '4':
                    numbers.push('３１', '３２')
                    break
    
                case '5':
                    numbers.push('３１')
                    break
    
                case '9':
                    numbers.push('１９', '２０', '２１', '２２', '２３', '２４', '２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                    break
            }
    
            break
    
        case 'X':
            switch (y)
            {
                case '0':
                    numbers.push('３１', '３２', '３３', '３４', '３５', '３６')
                    break
    
                case '1':
                    numbers.push('３３', '３６')
                    break
                
                case '2':
                    numbers.push('３２', '３３', '３５', '３６')
                    break
    
                case '3':
                    numbers.push('３２', '３５')
                    break
    
                case '4':
                    numbers.push('３１', '３２', '３４', '３５')
                    break
    
                case '5':
                    numbers.push('３１', '３４')
                    break
    
                case '9':
                    numbers.push('１９', '２０', '２１', '２２', '２３', '２４', '２５', '２６', '２７', '２８', '２９', '３０', '３１', '３２', '３３', '３４', '３５', '３６')
                    break
            }
    
            break
    
        case 'Y':
            switch (y)
            {
                case '0':
                    numbers.push('３４', '３５', '３６')
                    break
    
                case '1':
                    numbers.push('３６')
                    break
                
                case '2':
                    numbers.push('３５', '３６')
                    break
    
                case '3':
                    numbers.push('３５')
                    break
    
                case '4':
                    numbers.push('３４', '３５')
                    break
    
                case '5':
                    numbers.push('３４')
                    break
            }
    
            break
    
        case '0':
            switch (y)
            {
                case '1':
                    numbers.push('０３', '０６', '０９', '１２', '１５', '１８', '２１', '２４', '２７', '３０', '３３', '３６')
                    break
    
                case '3':
                    numbers.push('０２', '０５', '０８', '１１', '１４', '１７', '２０', '２３', '２６', '２９', '３２', '３５')
                    break
    
                case '5':
                    numbers.push('０１', '０４', '０７', '１０', '１３', '１６', '１９', '２２', '２５', '２８', '３１', '３４')
                    break
            }
    
            break
    }

    return numbers
}