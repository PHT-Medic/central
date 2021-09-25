import {URL} from "url";
import env from "../../env";
import {parseHarborConnectionString} from "../../modules/api/provider/harbor";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

export function getFullHarborRepositoryNamePath(name: string): string {
    return harborUrL.hostname + '/' + name;
}
