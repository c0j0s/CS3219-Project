import * as amqp from 'amqplib';
import logger from "./logger";
import Room from '../../models/types/room';

export class RabbitMQManager {
    private static timeout = Number(process.env.MATCHING_TIMEOUT) || 60000;
    private static queueEndpoint = `amqp://${process.env.QUEUE_URL || "localhost"}`
    private static connection: Promise<amqp.Connection>;

    static connectToRabbitMQ(): Promise<amqp.Connection> {
        if (!RabbitMQManager.connection) {
            RabbitMQManager.connection = RabbitMQManager.createConnection();
        }
        return RabbitMQManager.connection;
    }

    private static async createConnection(): Promise<amqp.Connection> {
        try {
            const connection = await amqp.connect(RabbitMQManager.queueEndpoint);
            logger.debug(`[RabbitMQManager.createConnection] RabbitMQ connection established at ${RabbitMQManager.queueEndpoint}`);
            return connection;
        } catch (error) {
            logger.error(`[RabbitMQManager.createConnection.error] Error connecting to RabbitMQ:`, error);
            throw error;
        }
    }

    async publishPublicAndConsumeMatched(
        id: string, 
        myRoom: Room, 
        matched: (message: string) => void, 
        noMatch: () => void,
        goodMatch: (room: string) => boolean, 
    ): Promise<void> {
        try {
            const connection = await RabbitMQManager.connectToRabbitMQ();
            const channel = await connection.createChannel();
            let timer: NodeJS.Timeout | undefined;

            // create and subscribe to private channel for receiving matching invitation
            const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });
            const consumePrivatePromise = channel.consume(replyQueue, async (message) => {
                if (message) {
                    // ensure not getting our own messages
                    if (message.properties.correlationId !== id) {
                        // stop subscriptions to channels once match was found
                        clearTimeout(timer);
                        consumePrivatePromise.then((consumerTag) => {
                            channel.cancel(consumerTag.consumerTag);
                        });
                        consumePublicPromise.then((consumerTag) => {
                            channel.cancel(consumerTag.consumerTag);
                        });
                        // remove private channel 
                        await channel.deleteQueue(replyQueue);
                        // call matched callback, first come first served basis
                        matched(message.content.toString());
                    }
                }
            }, { noAck: true });

            // subscribe to public channel to wait for future incoming matching request
            await channel.assertQueue('public');
            const consumePublicPromise = channel.consume('public', (message) => {
                if (message) {
                    // ensure not getting our own messages
                    if (message.properties.correlationId !== id) {
                        // matching algorithm callback
                        if (goodMatch(message.content.toString())) {
                            // stop subscriptions to channels once match was found
                            clearTimeout(timer);
                            consumePrivatePromise.then((consumerTag) => {
                                channel.cancel(consumerTag.consumerTag);
                            });
                            consumePublicPromise.then((consumerTag) => {
                                channel.cancel(consumerTag.consumerTag);
                            });
                            // contact matching request through its private channel
                            channel.sendToQueue(message.properties.replyTo, Buffer.from(JSON.stringify(myRoom)), {
                                correlationId: id
                            });
                        }
                    }
                }
            }, { noAck: true });

            // Send a matching request to public channel for exiting active users on wait to pickup
            logger.debug({
                correlationId: id,
                replyTo: replyQueue,
                expiration: RabbitMQManager.timeout
            }, `[publishPublicAndConsumeMatched] Matching request published to public queue:`);
            channel.sendToQueue("public", Buffer.from(JSON.stringify(myRoom)), {
                correlationId: id,
                replyTo: replyQueue,
                expiration: RabbitMQManager.timeout
            });

            // timeout and remove consumers on all channels
            timer = setTimeout(async () => {
                logger.info("[publishPublicAndConsumeMatched] timeout", id);
                consumePrivatePromise.then((consumerTag) => {
                    channel.cancel(consumerTag.consumerTag);
                });
                consumePublicPromise.then((consumerTag) => {
                    channel.cancel(consumerTag.consumerTag);
                });
                await channel.deleteQueue(replyQueue);
                noMatch();
            }, RabbitMQManager.timeout + 1000);
        } catch (error) {
            logger.error(error);
        } 
    }
}
