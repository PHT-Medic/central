import {Message} from "amqp-extension";
import {DockerOptions} from "dockerode";
import {URL} from "url";
import {getFullHarborRepositoryNamePath} from "../../config/services/harbor";
import env from "../../env";
import {parseHarborConnectionString} from "../../modules/api/provider/harbor";
import {DockerPullOptions, pullDockerRegistryImage} from "../../modules/docker";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

const dockerOptions : DockerPullOptions = {
    authconfig: {
        username: harborConfig.user,
        password: harborConfig.password,
        serveraddress: harborUrL.hostname
    }
};

export async function downloadImage(message: Message) {
    const repositoryTag = getFullHarborRepositoryNamePath(message.data.repositoryFullName);

    await pullDockerRegistryImage(repositoryTag, dockerOptions);

    return message;
}
