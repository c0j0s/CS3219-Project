import pino from 'pino';

export function createLogger(prefix: string) {
    return pino({
        level: process.env.LOG_LEVEL || 'debug',
        msgPrefix: `[${prefix}] `,
    });
}

const logger = createLogger('matching-service');
export default logger