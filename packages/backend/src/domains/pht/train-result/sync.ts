import {getHarborProjectRepositories} from "../../service/harbor/project/repository/api";
import {getRepository, In} from "typeorm";
import {TrainResult} from "./index";

import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../config/services/harbor";
import {createResultServiceResultCommand} from "../../service/result-service/queue";

export async function syncTrainResults(onlyUncovered: boolean = true) {
    const harborRepositories = await getHarborProjectRepositories(HARBOR_OUTGOING_PROJECT_NAME);
    const harborRepositoryNames : string[] = harborRepositories.map(harborRepository => harborRepository.name);

    if(harborRepositoryNames.length === 0) {
        return;
    }

    const repository = getRepository(TrainResult);

    const trainResults = await repository.find({
        train_id: In(harborRepositoryNames)
    });

    if(onlyUncovered) {
        for(let i=0; i<harborRepositories.length; i++) {
            const index = trainResults.findIndex(result => result.train_id === harborRepositories[i].name);
            if(index === -1) {
                // create result
                const dbData = repository.create({
                    image: harborRepositories[i].fullName,
                    train_id: harborRepositories[i].name
                });

                await repository.save(dbData);

                // send queue message
                await createResultServiceResultCommand('download', {
                    projectName: harborRepositories[i].projectName,
                    repositoryName: harborRepositories[i].name,
                    repositoryFullName: harborRepositories[i].fullName,

                    trainId: harborRepositories[i].name,
                    resultId: dbData.id
                });
            }
        }
    } else {
        for(let i=0; i<harborRepositories.length; i++) {
            const index = trainResults.findIndex(result => result.train_id === harborRepositories[i].name);
            let trainResult : undefined | TrainResult;

            if(index === -1) {
                // create result
                const dbData = repository.create({
                    image: harborRepositories[i].fullName,
                    train_id: harborRepositories[i].name
                });

                await repository.save(dbData);

                trainResult = dbData;
            } else {
                trainResult = trainResults[index];
            }

            // send queue message
            if(typeof trainResult !== 'undefined') {
                await createResultServiceResultCommand('download', {
                    projectName: harborRepositories[i].projectName,
                    repositoryName: harborRepositories[i].name,
                    repositoryFullName: harborRepositories[i].fullName,

                    trainId: harborRepositories[i].name,
                    resultId: trainResult.id
                });
            }
        }
    }
}

