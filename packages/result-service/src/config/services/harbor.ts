import { URL } from 'url';
import { parseHarborConnectionString } from '../../domains/service/harbor';
import env from '../../env';

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

/**
 * Outgoing train project name
 */
export const HARBOR_OUTGOING_PROJECT_NAME = 'pht_outgoing';

export function getHarborFQRepositoryPath(
    name: string,
    projectName?: string,
): string {
    return [
        harborUrL.hostname,
        projectName ?? HARBOR_OUTGOING_PROJECT_NAME,
        name,
    ].join('/');
}
