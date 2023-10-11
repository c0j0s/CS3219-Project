import pino from 'pino';

export function createLogger(prefix: string) {
    return pino({
        level: process.env.LOG_LEVEL || 'debug',
        formatters: {
            log(object) {
                return { ...object, msg: `[${prefix}] ${object.msg}` };
            },
        },
    });
}

const logger = createLogger('collaboration-service');
export default logger;