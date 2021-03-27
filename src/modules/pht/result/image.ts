import fs from 'fs';
import {URL} from 'url';
import path from "path";

import tar, {Pack} from 'tar-stream';

import {useDocker} from "./index";
import {getWritableDirPath} from "../../../config/paths";
import {parseHarborConnectionString} from "../../api/provider/harbor";
import env from "../../../env";
import {ContainerInspectInfo} from "dockerode";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

const dockerOptions = {
    authconfig: {
        username: harborConfig.user,
        password: harborConfig.password,
        serveraddress: harborUrL.hostname
    }
};

export function getFullHarborRepositoryNamePath(name: string): string {
    return harborUrL.hostname + '/' + name;
}

export async function downloadHarborRepositoryImages(repositoryFullName: string) : Promise<any> {
    const path = getFullHarborRepositoryNamePath(repositoryFullName);
    const stream = await useDocker().pull(path, dockerOptions);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: any, output: any) => {
            if(error) {
                reject(error);
            }

            resolve(output);
        }, (e: any) => e);
    }));
}

export async function dropHarborImage(repositoryFullName: string) : Promise<void> {
    const path = getFullHarborRepositoryNamePath(repositoryFullName);

    await useDocker()
        .getImage(path)
        .remove();
}

//-------------------------------------------------------

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

function extractTarStreamToPacker(stream: NodeJS.ReadableStream, packer: Pack) : Promise<void> {
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

export async function saveAndExtractHarborImage(id: string, repositoryFullName: string) : Promise<void> {
    const trainPath : string = getTrainResultDirectoryPath();

    await ensureResultDirectory(trainPath);

    const trainResultPath : string = getTrainResultFilePath(id);

    await deleteExistingResultFile(trainResultPath);

    let destinationStream = fs.createWriteStream(trainResultPath, {
        mode: 0o775
    });

    const pack = tar.pack();

    pack.pipe(destinationStream);//b7d06085-1e64-4426-9f5d-bbe7b3212353

    try {
        const container = await useDocker().createContainer({
            Image: getFullHarborRepositoryNamePath(repositoryFullName)
        });

        const directories: string[] = ['/opt/pht_results', '/opt/train_config.json'];
        //const directories: string[] = ['/home'];
        for (let i = 0; i < directories.length; i++) {
            try {
                const archiveStream: NodeJS.ReadableStream = await container.getArchive({
                    path: directories[i]
                });

                await extractTarStreamToPacker(archiveStream, pack);
            } catch (e) {
                console.log(e);
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
    } catch (e) {
        console.log(e);

        throw e;
    }
}
