import { ImageInfo } from 'dockerode';
import { useDocker } from './instance';

export async function checkIfLocalRegistryImageExists(repositoryTag: string) : Promise<boolean> {
    const docker = await useDocker();

    return new Promise<boolean>((resolve) => {
        docker.searchImages(
            { term: repositoryTag },
            (images: ImageInfo[]) => {
                if (images.length > 0) {
                    resolve(true);
                }

                resolve(false);
            },
        );
    });
}
