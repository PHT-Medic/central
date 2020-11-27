import fs from 'fs';
import Docker from "dockerode";

import {getFullTrainRepositoryName, TrainRepository} from "./repository";
import {getPublicDirPath, writablePath} from "../../../config/paths";
import {Stream} from "stream";
import path from "path";
import {useDocker} from "./index";

const dockerOptions = {
    authconfig: {
        username: 'pht',
        password: 'PangerLenis32',
        serveraddress: 'harbor.personalhealthtrain.de'
    }
};

export async function downloadTrainImage(trainRepository: TrainRepository) {
    const stream = await useDocker().pull(getFullTrainRepositoryName(trainRepository), dockerOptions);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: any, output: any) => {
            if(error) {
                reject(error);
            }

            resolve(output);
        }, (e: any) => e);
    }));
}

export async function saveTrainImageDirectory(trainRepository: TrainRepository, directory?: string) {
    try {
        const container = await useDocker().createContainer({
            Image: getFullTrainRepositoryName(trainRepository)
        });

        const trainPath : string = path.resolve(getPublicDirPath()+'/train');

        try {
            const stats = await fs.promises.stat(trainPath);
            console.log(stats);
        } catch (e) {
            await fs.promises.mkdir(trainPath, 770);
        }

        const trainFilePath = path.resolve(trainPath+'/'+trainRepository.trainId+'.tar');

        const archive: Stream = await container.getArchive({
            path: directory ?? '/opt/pht_results'
        });

        await fs.promises.writeFile(trainFilePath, archive, 'utf-8');
    } catch (e) {
        throw new Error('Das Zug Image Verzeichnis konnte nicht extrahiert und gespeichert werden...');
    }
}
