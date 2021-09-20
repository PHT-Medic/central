import {Train} from "../index";
import {getRepository, Repository} from "typeorm";

export async function findTrain(
    train: Train | number | string,
    repository?: Repository<Train>
) : Promise<Train | undefined> {
    repository ??= getRepository(Train);
    return typeof train === 'number' || typeof train === 'string' ? await repository.findOne(train) : train;
}
