import RabbitMQ, {Connection} from 'amqplib';
import env from "../../env";

let connection : Connection | undefined;

export async function useMessageQueue() {
    if(typeof connection !== 'undefined') {
        return connection;
    }

    connection = await RabbitMQ.connect(env.rabbitMqConnectionString);
    return connection;
}


