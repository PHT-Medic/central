import Docker from 'dockerode';

import {schedule} from 'node-cron';

import {downloadTrainImage, saveTrainImageDirectory} from "./image";
import {getTrainRepositories, TrainRepository} from "./repository";
import {getRepository, In} from "typeorm";
import {TrainResult} from "../../../domains/pht/train/result";
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

async function runPHTResultScheduler() {
    console.log('Check for trains...');

    try {
        const harborTrains = await getTrainRepositories();
        const harborTrainIds : number[] = harborTrains.map(trainRepository => trainRepository.trainId);

        const repository = getRepository(TrainResult);

        let trainResults : TrainResult[] = [];

        if(harborTrainIds.length > 0) {
            trainResults = await repository.find({
                train_id: In(harborTrainIds)
            });
        }

        const nonProceedTrains = harborTrains.filter((trainRepository: TrainRepository) => {
            return trainResults.length === 0 || trainResults.findIndex((trainResult: TrainResult) => trainResult.train_id === trainRepository.trainId) === -1;
        });

        if(nonProceedTrains.length > 0) {
            for(let i=0; i<nonProceedTrains.length; i++) {
                await downloadTrainImage(nonProceedTrains[i]);
                await saveTrainImageDirectory(nonProceedTrains[i]);
            }

            const entities : TrainResult[] = nonProceedTrains.map((trainRepository: TrainRepository) => {
                return repository.create({
                    train_id: trainRepository.trainId
                })
            });

            await repository.save(entities);

            const trainIds = nonProceedTrains.map(trainRepository => trainRepository.trainId);

            await getRepository(Train).update({
                id: In(trainIds)
            },{
                status: TrainStateFinished
            })
        }
    } catch (e) {
        console.log(e.message);
    }
}

export default function createPHTResultService() {
    schedule('* * * * *', runPHTResultScheduler);
}
