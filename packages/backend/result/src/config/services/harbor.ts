import { URL } from 'url';
import { parseHarborConnectionString } from '../../domains/service/harbor';
import env from '../../env';

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

export function getHarborFQRepositoryPath(
    projectName: string,
    repositoryName: string,
): string {
    return [
        harborUrL.hostname,
        projectName,
        repositoryName,
    ].join('/');
}
