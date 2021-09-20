import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";

export async function detectTrainBuildStatus(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    return train;
}
