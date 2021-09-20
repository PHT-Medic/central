import {Train} from "../../../../../domains/pht/train";
import {
    findHarborProjectRepository,
    HarborRepository
} from "../../../../../domains/service/harbor/project/repository/api";
import {
    buildStationHarborProjectName,
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME
} from "../../../../../config/services/harbor";
import {
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainRunStatus,
} from "../../../../../domains/pht/train/status";
import {getRepository} from "typeorm";
import {TrainStation} from "../../../../../domains/pht/train/station";

export async function detectTrainRunStatus(train: Train) : Promise<Train> {
    const repository = getRepository(Train);

    // 1. Check PHT outgoing ( -> TrainFinished )
    let harborRepository: HarborRepository | undefined = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, train.id);
    if(typeof harborRepository !== 'undefined') {
        train = repository.merge(train, {
            build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
            configurator_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
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
                configurator_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
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
            configurator_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
            run_station_id: null, // optional, just to ensure
            run_status: null
        });

        await repository.save(train);

        return train
    }

    train = repository.merge(train, {
        run_station_id: null,
        run_status: null
    });

    await repository.save(train);

    return train
}
