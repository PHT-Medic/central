import {Train} from "../pht/train";
import {createQueueMessageTemplate, QueueMessage} from "../../modules/message-queue";
import {getRepository} from "typeorm";
import {UserKeyRing} from "../user/key-ring";
import {TrainFile} from "../pht/train/file";

export async function createTrainBuilderQueueMessage(train: Train) : Promise<QueueMessage> {
    let queueMessage = createQueueMessageTemplate();
    queueMessage.metadata = {
        token: undefined
    }

    const keyRingRepository = getRepository(UserKeyRing);
    const keyRing = await keyRingRepository.findOne({
        user_id: train.user_id
    })

    const filesRepository = getRepository(TrainFile);

    const files = await filesRepository
        .createQueryBuilder('file')
        .where('file.train_id = :id', {id: train.id})
        .getMany();

    queueMessage.data = {
        userId: train.user_id,
        trainId: train.id,
        proposalId: train.proposal_id,
        stations: train.stations.map(station => station.id),
        files: files.map(file => file.directory + '/' + file.name),
        masterImage: train.master_image.external_tag_id,
        entrypointExecutable: train.entrypoint_executable,
        entrypointPath: train.entrypoint_file.directory + '/' + train.entrypoint_file.name,
        sessionId: train.session_id,
        hash: train.hash,
        hashSigned: train.hash_signed,
        query: train.query,
        user_he_key: !!keyRing ? keyRing.he_key : null
    }
    return queueMessage
}
