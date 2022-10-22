import { createLogger, format } from 'winston'
import * as wistonDaily from 'winston-daily-rotate-file'

let logger = createLogger({
    format: format.combine(format.timestamp({ format: `YYYY-MM-DD HH:mm:ss` }), format.printf((info: any) => `${info.timestamp} - ${info.level}: ${info.message}`)),
    transports:
    [
        new wistonDaily.default({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: './logs',
            filename: `%DATE%.log`,
            maxFiles: 7,  // 30일치 로그 파일 저장
            zippedArchive: true, 
        }),
        new wistonDaily.default({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: './logs/error',
            filename: `%DATE%.error.log`,
            maxFiles: 7,  // 30일치 로그 파일 저장
            zippedArchive: true, 
        })
    ]
})

export { logger }