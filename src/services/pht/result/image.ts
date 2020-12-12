import fs from 'fs';
import tar from 'tar-stream';

import { getWritableDirPath} from "../../../config/paths";
import path from "path";
import {useDocker} from "./index";
import {streamToString} from "./utils";
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

export async function saveTrainImageDirectory(trainResult: TrainResult) {
    try {
        const container = await useDocker().createContainer({
            Image: trainResult.image
        });

        const trainPath : string = getTrainResultDirectoryPath();

        try {
            await fs.promises.stat(trainPath);
            await fs.promises.chmod(trainPath, 0o775);
        } catch (e) {
            await fs.promises.mkdir(trainPath, {
                mode: 0o775
            });
        }

        const trainResultPath : string = getTrainResultFilePath(trainResult.id);

        const pack = tar.pack();

        const directories : string[] = ['/opt/pht_results', '/opt/user_sym_key.key'];
        for(let i=0; i<directories.length; i++) {
            const name: string | undefined = directories[i].split('/').pop();

            try {
                const archiveStream: NodeJS.ReadableStream = await container.getArchive({
                    path: directories[i]
                });

                const archive = await streamToString(archiveStream);

                if (typeof name === 'undefined') {
                    continue;
                }

                pack.entry({name: name + '.tar'}, archive);
            } catch (e) {
                console.error('Extracting Directory/File:'+ directories[i] + ' of Container:'+container.id+' failed...');
            }
        }

        await new Promise(((resolve, reject) => {
            try {
                if(fs.existsSync(trainResultPath)) {
                    fs.unlinkSync(trainResultPath);
                }
            } catch (e) {

            }

            let destinationStream = fs.createWriteStream(trainResultPath, {
                mode: 0o775
            });

            destinationStream.on('close', () => {
                return fs.promises.access(trainResultPath, fs.constants.R_OK)
                    .then(resolve)
                    .catch(reject);
            });

            pack.pipe(destinationStream);
            pack.finalize();
        }))
    } catch (e) {
        throw new Error('Das Zug Image Verzeichnis konnte nicht extrahiert und gespeichert werden...');
    }
}
