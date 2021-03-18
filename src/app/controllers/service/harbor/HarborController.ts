import {getFullTrainRepositoryName, TrainRepository} from "../../../../modules/pht/result/repository";
import {getRepository} from "typeorm";
import {Train} from "../../../../domains/pht/train";
import {TrainResult} from "../../../../domains/pht/train/result";
import {TrainStateFinished} from "../../../../domains/pht/train/states";
import {createQueueMessageTemplate, publishQueueMessage} from "../../../../modules/message-queue";

export async function postHarborHookRouteHandler(req: any, res: any) {
    console.log('Service with id: ' + req.serviceId + ' called hook route');

    const { type, event_data:eventData } = req.body;

    const trainRepository: Partial<TrainRepository> = {
        id: eventData.repository.name,
        name: eventData.repository.name,
        trainId: eventData.repository.name,
        image: getFullTrainRepositoryName(eventData.repository.repo_full_name),
        createdAt: eventData.repository.date_created
    }

    const repository = getRepository(Train);
    const resultRepository = getRepository(TrainResult);

    const isStationRepository : boolean = eventData.repository.namespace.startsWith('station_') || Number.isInteger(eventData.repository.namespace);
    const isIncomingRepository : boolean = eventData.repository.namespace === 'pht_incoming';
    const isOutgoingRepository : boolean = eventData.repository.namespace === 'pht_outgoing';


    switch (type) {
        case 'PUSH_ARTIFACT':
            // Result Service
            if(isOutgoingRepository) {
                const train = await repository.createQueryBuilder('train')
                    .where("id = :id", {id: trainRepository.trainId})
                    .leftJoinAndSelect('train.result', 'result')
                    .getOne();

                if(train && train.result) {
                    return res.status(200).end();
                }

                const trainResult = resultRepository.create({
                    train_id: trainRepository.trainId,
                    image: trainRepository.image
                });

                await resultRepository.save(trainResult);

                await repository.update({
                    id: train.id
                },{
                    status: TrainStateFinished
                });

                let queueMessage = createQueueMessageTemplate();
                queueMessage.type = 'download'
                queueMessage.metadata = {
                    token: undefined
                }

                queueMessage.data = {
                    trainId: trainRepository.trainId,
                    resultImage: trainRepository.image,
                    resultId: trainResult.id
                }

                await publishQueueMessage('rs.command',queueMessage);
            }

            // Train Router
            if(!isOutgoingRepository) {
                let queueMessage = createQueueMessageTemplate();
                queueMessage.type = 'PUSH_ARTIFACT'
                queueMessage.metadata = {
                    token: undefined
                }

                queueMessage.data = {
                    repositoryFullName: eventData.repository.repo_full_name
                }

                await publishQueueMessage('tr.harbor',queueMessage);
            }

            return res.status(200).end();
    }

    return res.status(200).end();
}
