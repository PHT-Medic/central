import {Environment} from "./env";
import {buildTrainBuilderAggregator} from "./aggregators/train-builder";
import {buildTrainResultAggregator} from "./aggregators/train-result";
import {buildHarborAggregator} from "./aggregators/harbor";
import {useVaultApi} from "./modules/api/service/vault";
import {useHarborApi} from "./modules/api/service/harbor";
import {buildServiceSecurityComponent} from "./components/service-security";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    const aggregators : {start: () => void}[] = [
        buildHarborAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator()
    ];

    const components : {start: () => void}[] = [
        buildServiceSecurityComponent()
    ];

    useVaultApi(env.vaultConnectionString);
    useHarborApi(env.harborConnectionString);

    return {
        aggregators,
        components
    }
}

export default createConfig;
