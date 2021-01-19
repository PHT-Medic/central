import fs from 'fs';
import tar, {Pack} from 'tar-stream';

import { getWritableDirPath} from "../../../config/paths";
import path from "path";
import {useDocker} from "./index";
import {TrainResult} from "../../../domains/pht/train/result";

const dockerOptions = {
    authconfig: {
        username: 'pht',
        password: 'PangerLenis32',
        serveraddress: 'harbor.personalhealthtrain.de'
    }
};

export async function downloadTrainImage(trainResult: TrainResult) {
    const stream = await useDocker().pull(trainResult.image, dockerOptions);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: any, output: any) => {
            if(error) {
                reject(error);
            }

            resolve(output);
        }, (e: any) => e);
    }));
}

export function getTrainResultDirectoryPath() {
    return path.resolve(getWritableDirPath()+'/train-results');
}

export function getTrainResultFilePath(trainResultId: string) {
    return path.resolve(getTrainResultDirectoryPath()+'/'+trainResultId+'.tar');
}

//-------------------------------------------------------

async function ensureResultDirectory(directoryPath: string) {
    try {
        await fs.promises.stat(directoryPath);
        await fs.promises.chmod(directoryPath, 0o775);
    } catch (e) {
        await fs.promises.mkdir(directoryPath, {
            mode: 0o775
        });
    }
}

async function deleteExistingResultFile(filePath: string) {
    if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

function extractTarStreamToPacker(stream: NodeJS.ReadableStream, packer: Pack) {
    return new Promise((resolve,reject) => {
        const extract = tar.extract();

        extract.on('entry', function (header, stream, callback) {
            stream.pipe(packer.entry(header, callback))
        });

        extract.on('finish', () => {
            resolve();
        });

        extract.on('error', () => {
            reject();
        })

        stream.pipe(extract);
    })

}

//------------------------------------------------------------

export async function saveTrainImageResult(trainResult: TrainResult) {
    const trainPath : string = getTrainResultDirectoryPath();

    await ensureResultDirectory(trainPath);

    const trainResultPath : string = getTrainResultFilePath(trainResult.id);

    await deleteExistingResultFile(trainResultPath);

    let destinationStream = fs.createWriteStream(trainResultPath, {
        mode: 0o775
    });

    const pack = tar.pack();

    pack.pipe(destinationStream);

    const container = await useDocker().createContainer({
        Image: trainResult.image
    });

    const directories: string[] = ['/opt/pht_results', '/opt/train_config.json'];
    for (let i = 0; i < directories.length; i++) {
        try {
            const archiveStream: NodeJS.ReadableStream = await container.getArchive({
                path: directories[i]
            });

            await extractTarStreamToPacker(archiveStream, pack);
        } catch (e) {
            console.error('Extracting Directory/File:' + directories[i] + ' of Container:' + container.id + ' failed...');
        }
    }

    return await new Promise(((resolve, reject) => {
        destinationStream.on('close', () => {
            const exists : boolean = fs.existsSync(trainResultPath);
            if(exists) {
                resolve();
            } else {
                reject();
            }
        });

        pack.finalize();
    }));
}
