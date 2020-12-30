import Docker from 'dockerode';
import {schedule} from 'node-cron';
import {downloadTrainImage, saveTrainImageResult} from "./image";
import {getTrainRepositories, TrainRepository} from "./repository";
import {getRepository, In} from "typeorm";
import {TrainResult} from "../../../domains/pht/train/result";
import {
    TrainResultStateDownloaded,
    TrainResultStateDownloading,
    TrainResultStateExtracting,
    TrainResultStateFailed,
    TrainResultStateFinished,
    TrainResultStateOpen
} from "../../../domains/pht/train/result/states";
import {Train} from "../../../domains/pht/train";
import {TrainStateFinished} from "../../../domains/pht/train/states";

let dockerInstance : Docker | undefined;

export function useDocker() : Docker {
    if(typeof dockerInstance !== 'undefined') {
        return dockerInstance;
    }

    dockerInstance = new Docker();
    return dockerInstance;
}

async function runPHTTrainSyncer() {
    let harborTrains;

    try {
        harborTrains = await getTrainRepositories();
    } catch (e) {
        return;
    }

    const harborTrainIds : string[] = harborTrains.map(trainRepository => trainRepository.trainId);

    if(harborTrainIds.length === 0) {
        return;
    }

    const repository = getRepository(Train);
    const trains = await repository.createQueryBuilder('train')
        .leftJoinAndSelect('train.result', 'result')
        .where({
            id: In(harborTrainIds)
        })
        .getMany();

    if(trains.length === 0) return;

    const resultRepository = getRepository(TrainResult);

    const openTrainResults : Partial<TrainResult>[] = harborTrains
        .filter((trainRepository: TrainRepository) => {
            return trains.findIndex((train: Train) => train.id === trainRepository.trainId && !train.result) !== -1;
        })
        .map((trainRepository: TrainRepository) => {
            return resultRepository.create({
                train_id: trainRepository.trainId,
                image: trainRepository.image
            })
        });

    if(openTrainResults.length > 0) {
        await resultRepository.save(openTrainResults);

        await repository.update({
            id: In(openTrainResults.map(result => result.train_id))
        }, {status: TrainStateFinished});
    }

    console.log(openTrainResults);
}

async function runPHTTrainDownloader() {
    const repository = getRepository(TrainResult);

    let trainResults : TrainResult[] = await repository.find({
        status: TrainResultStateOpen
    });

    if(trainResults.length === 0) return;

    trainResults = trainResults.map((trainResult: TrainResult) => {
        return {...trainResult, status: TrainResultStateDownloading}
    });

    await repository.save(trainResults);

    console.log(trainResults);

    for(let i=0; i<trainResults.length; i++) {
        try {
            await downloadTrainImage(trainResults[i]);
            trainResults[i] = repository.merge(trainResults[i], {status: TrainResultStateDownloaded});
        } catch (e) {
            console.log(e);
            trainResults[i] = repository.merge(trainResults[i], {status: TrainResultStateFailed});
        }
        await repository.save(trainResults[i]);
    }

    console.log(trainResults);
}

async function runPHTTrainExtractor() {
    const repository = getRepository(TrainResult);

    let trainResults : TrainResult[] = await repository.find({
        status: In([TrainResultStateExtracting, TrainResultStateDownloaded])
    });

    trainResults = trainResults.map((trainResult: TrainResult) => {
        return {...trainResult, status: TrainResultStateExtracting}
    });

    if(trainResults.length === 0) return;

    console.log(trainResults);

    await repository.save(trainResults);

    for(let i=0; i<trainResults.length; i++) {
        try {
            await saveTrainImageResult(trainResults[i]);
            trainResults[i] = repository.merge(trainResults[i], {status: TrainResultStateFinished});

        } catch (e) {
            trainResults[i] = repository.merge(trainResults[i], {status: TrainResultStateFailed});
        }

        await repository.save(trainResults[i]);
    }

    console.log(trainResults);
}

async function runPHTResultScheduler() {
    console.log('Check for trains...');

    try {
        await runPHTTrainSyncer();
        await runPHTTrainDownloader();
        await runPHTTrainExtractor();
    } catch (e) {
        console.log(e.message);
    }
}

export default function createPHTResultService() {
    schedule('* * * * *', runPHTResultScheduler);
    runPHTResultScheduler();
}
