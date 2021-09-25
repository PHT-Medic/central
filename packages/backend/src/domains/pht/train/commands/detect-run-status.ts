import {Train} from "../index";
import {
    findHarborProjectRepository,
    HarborRepository
} from "../../../service/harbor/project/repository/api";
import {
    buildStationHarborProjectName,
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME
} from "../../../../config/services/harbor";
import {
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainRunStatus,
} from "../status";
import {getRepository} from "typeorm";
import {TrainStation} from "../../train-station";
import {findTrain} from "./utils";
import {triggerTrainDownload} from "./trigger-download";

export async function detectTrainRunStatus(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if(typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    // 1. Check PHT outgoing ( -> TrainFinished )
    let harborRepository: HarborRepository | undefined = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, train.id);
    if(typeof harborRepository !== 'undefined') {
        // check if we marked the train as terminated yet :O ?
        if(train.run_status !== TrainRunStatus.FINISHED) {
            train.result = await triggerTrainDownload(train.id, harborRepository);
        }

        train = repository.merge(train, {
            build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
            configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
            run_station_id: null, // optional, just to ensure
            run_status: TrainRunStatus.FINISHED
        });

        await repository.save(train);

        return train
    }

    // 2. Check any Station Repository on route ( -> TrainRunning )
    const trainStationRepository = getRepository(TrainStation);
    const trainStationQueryBuilder = trainStationRepository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .orderBy({
            'trainStation.position': 'DESC',
            'trainStation.created_at': 'DESC'
        });

    const trainStations = await trainStationQueryBuilder.getMany();

    for(let i=0; i<trainStations.length; i++) {
        const stationName : string = buildStationHarborProjectName(trainStations[i].station.secure_id);
        harborRepository = await findHarborProjectRepository(stationName, train.id);
        if(typeof harborRepository === 'undefined') {
            train = repository.merge(train, {
                build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
                configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
                run_station_id: trainStations[i].station_id,
                run_status: TrainRunStatus.STARTED
            });

            await repository.save(train);

            return train;
        }
    }

    // 3. Check PHT incoming ( -> TrainBuilt )
    harborRepository = await findHarborProjectRepository(HARBOR_INCOMING_PROJECT_NAME, train.id);
    if(typeof harborRepository !== 'undefined') {
        train = repository.merge(train, {
            build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
            configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
            run_station_id: null, // optional, just to ensure
            run_status: null
        });

        await repository.save(train);

        return train;
    }

    train = repository.merge(train, {
        run_station_id: null,
        run_status: null
    });

    await repository.save(train);

    return train
}
