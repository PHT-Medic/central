import {buildDispatcherComponent} from "./components/event-dispatcher";
import {Environment} from "./env";
import {buildTrainBuilderAggregator} from "./aggregators/train-builder";
import {buildTrainResultAggregator} from "./aggregators/train-result";
import {buildDispatcherAggregator} from "./aggregators/dispatcher";
import {useVaultApi} from "./modules/api/service/vault";
import {useHarborApi} from "./modules/api/service/harbor";
import {buildCommandRouterComponent} from "./components/command-router";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    const aggregators : {start: () => void}[] = [
        buildDispatcherAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator()
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
        buildDispatcherComponent()
    ];

    useVaultApi(env.vaultConnectionString);
    useHarborApi(env.harborConnectionString);

    return {
        aggregators,
        components
    }
}

export default createConfig;
