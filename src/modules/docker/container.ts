import fs from "fs";
import tar, {Pack} from "tar-stream";
import {useDocker} from "./instance";

export async function saveDockerContainerPathsTo(
    containerName: string,
    containerDirectoryPaths: string[],
    destinationDirectoryPath: string
) {
    let destinationStream = fs.createWriteStream(destinationDirectoryPath, {
        mode: 0o775
    });

    const pack = tar.pack();

    pack.pipe(destinationStream);

    const container = await useDocker().createContainer({
        Image: containerName
    });

    for (let i = 0; i < containerDirectoryPaths.length; i++) {
        try {
            const archiveStream: NodeJS.ReadableStream = await container.getArchive({
                path: containerDirectoryPaths[i]
            });

            await extractTarStreamToPacker(archiveStream, pack);
        } catch (e) {
            console.error('Extracting Directory/File:' + containerDirectoryPaths[i] + ' of Container:' + container.id + ' failed...');
        }
    }

    return await new Promise<void>(((resolve, reject) => {
        destinationStream.on('close', () => {
            return fs.access(destinationDirectoryPath, fs.constants.F_OK, err => {
                if (err) {
                    return reject();
                }

                return resolve();
            });
        });

        pack.finalize();
    }));
}

function extractTarStreamToPacker(stream: NodeJS.ReadableStream, packer: Pack): Promise<void> {
    return new Promise((resolve, reject) => {
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
