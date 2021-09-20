import {TrainResult} from "../../train-result";
import {createResultServiceResultCommand} from "../../../service/result-service/queue";
import {getRepository} from "typeorm";
import {findHarborProjectRepository, HarborRepository} from "../../../service/harbor/project/repository/api";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../config/services/harbor";

export async function triggerTrainDownload(
    trainId: string,
    harborRepository?: HarborRepository
) : Promise<TrainResult> {
    if(typeof harborRepository === 'undefined') {
        harborRepository = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, trainId);
        if(typeof harborRepository === 'undefined') {
            throw new Error('The train has not arrived at the outgoing station yet...');
        }
    }

    const resultRepository = getRepository(TrainResult);
    let result = await resultRepository.findOne({train_id: trainId});

    let trainResult: undefined | TrainResult;

    if (typeof result === 'undefined') {
        // create result
        const dbData = resultRepository.create({
            image: harborRepository.fullName,
            train_id: harborRepository.name,
            status: null
        });

        await resultRepository.save(dbData);

        trainResult = dbData;
    } else {
        result = resultRepository.merge(result, {status: null});

        await resultRepository.save(result);

        trainResult = result;
    }

    // send queue message
    await createResultServiceResultCommand('download', {
        projectName: harborRepository.projectName,
        repositoryName: harborRepository.name,
        repositoryFullName: harborRepository.fullName,

        trainId: harborRepository.name,
        resultId: trainResult.id
    });

    return trainResult;
}
