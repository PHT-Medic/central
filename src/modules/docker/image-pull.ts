import {useDocker} from "./instance";
import {DockerPullOptions} from "./type";

export async function pullDockerRegistryImage(repositoryTag: string, dockerOptions: DockerPullOptions) {
    const stream = await useDocker().pull(repositoryTag, dockerOptions);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: Error, output: any) => {
            if(error) {
                reject(error);
            }

            resolve(output);
        }, (e: any) => e);
    }));
}
