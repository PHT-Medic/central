import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";
import crypto from "crypto";
import {getTrainFileFilePath} from "../../train-file/path";
import fs from "fs";
import {TrainConfigurationStatus} from "../status";
import {TrainFile} from "../../train-file";

export async function generateTrainHash(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    const hash = crypto.createHash('sha512');
    // User Hash
    hash.update(Buffer.from(train.user_id.toString(), 'utf-8'));


    // Files
    const trainFilesRepository = getRepository(TrainFile);
    const trainFiles = await trainFilesRepository.createQueryBuilder('trainFiles')
        .where("trainFiles.train_id = :id", {id: train.id})
        .getMany();

    for (let i = 0; i < trainFiles.length; i++) {
        const filePath = getTrainFileFilePath(trainFiles[i]);

        const fileContent = fs.readFileSync(filePath);

        // File Hash
        hash.update(fileContent);
    }

    // Session Id hash
    const sessionId: Buffer = crypto.randomBytes(64);
    hash.update(sessionId);

    const query: Buffer | undefined = !!train.query && train.query !== '' ?
        Buffer.from(train.query, 'utf-8') :
        undefined;

    if (typeof query !== 'undefined') {
        hash.update(query);
    }

    train.session_id = sessionId.toString('hex');

    train.hash = hash.digest('hex');
    train.configurator_status = TrainConfigurationStatus.HASH_GENERATED;

    train = await repository.save(train);

    return train;
}
