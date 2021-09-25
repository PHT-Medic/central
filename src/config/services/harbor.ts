import {URL} from "url";
import {parseHarborConnectionString} from "../../domains/service/harbor";
import env from "../../env";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

export function getFullHarborRepositoryNamePath(name: string): string {
    return harborUrL.hostname + '/' + name;
}
