import {Train} from "../../../domains/pht/train";
import {v4} from "uuid";
import {QueueMessage} from "../../message-queue/message";

export async function createTrainBuilderQueueMessage(train: Train) : Promise<QueueMessage> {
    return  {
        id: v4(),
        type: undefined,
        metadata: {
            token: undefined
        },
        data: {
            userId: train.user_id,
            trainId: train.id,
            proposalId: train.proposal_id,
            stations: train.stations.map(station => station.id),
            masterImage: train.master_image.external_tag_id,
            entrypointExecutable: train.entrypoint_executable,
            entrypointPath: train.entrypoint_file.directory + '/' + train.entrypoint_file.name,
            sessionId: train.session_id,
            hash: train.hash,
            hashSigned: train.hash_signed,
            query: train.query
        }
    }
    /*
    let message: Record<string, any> = {
        type: train.type,
        train_id: train.id,
        proposal_id: train.proposal_id,
        user_id: train.user_id,
        user_public_key: undefined,
        user_signature: train.hash_signed,
        route: train.stations.map((station: Station) => {
            return station.id;
        }),
        master_image: train.master_image.external_tag_id,
        endpoint: {
            name: 'default', // not necessary anymore
            command: 'run', // executable: python | r
            files: train.files // {name: 'test.py', content: 'xy', path: '/.../', isEntrypoint: boolean}
        }
    };

    if(withPublicKey) {
        const publicKey = await getRepository(UserPublicKey).findOne({user_id: train.user_id});
        if(typeof publicKey === 'undefined') {
            throw new Error('Es konnte kein assozierter Public Key gefunden werden...');
        }

        message.user_public_key = publicKey.content;
    }

    console.log(message);

    return message;
     */
}
