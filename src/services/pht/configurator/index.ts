import {Train} from "../../../domains/pht/train";
import {getRepository} from "typeorm";
import {UserPublicKey} from "../../../domains/user/public-key";
import {Station} from "../../../domains/pht/station";

export async function createTrainBuilderMessage(train: Train, withPublicKey: boolean = true) : Promise<Record<string, any>> {
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
}
