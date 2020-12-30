import {subscribeQueueMessage} from "../../message-queue/message";
import {Channel, ConsumeMessage} from "amqplib";
import {getRepository} from "typeorm";
import {Train} from "../../../domains/pht/train";
import {TrainStateBuilt, TrainStateFailed} from "../../../domains/pht/train/states";

export async function consumePHTrainQueue() {
    await subscribeQueueMessage('pht-ui-server', async (channel: Channel, msg: ConsumeMessage) => {
        const messageEncoded : string = msg.content.toString('utf-8');
        const messageContent = JSON.parse(messageEncoded);

        if(typeof messageContent === 'string') {
            return channel.ack(msg);
        }

        const repository = getRepository(Train);

        switch (messageContent.type) {
            case 'trainBuildFailed':
                await repository.update({
                    id: messageContent.data.trainId
                }, {
                    status: TrainStateFailed
                });
                break;
            case 'trainBuilt':
                await repository.update({
                    id: messageContent.data.trainId
                }, {
                    status: TrainStateBuilt
                });
                break;
        }
        console.log(messageContent.data.trainId + ' : ' + messageContent.type);

        await channel.ack(msg);
    });
}
