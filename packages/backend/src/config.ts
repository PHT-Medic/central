import {setConfig} from "amqp-extension";
import {buildDispatcherComponent} from "./components/event-dispatcher";
import {Environment} from "./env";
import {buildTrainBuilderAggregator} from "./aggregators/train-builder";
import {buildTrainResultAggregator} from "./aggregators/train-result";
import {buildDispatcherAggregator} from "./aggregators/dispatcher";
import {useVaultApi} from "./modules/api/service/vault";
import {useHarborApi} from "./modules/api/service/harbor";
import {buildCommandRouterComponent} from "./components/command-router";
import {buildTrainRouterAggregator} from "./aggregators/train-router";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    useVaultApi(env.vaultConnectionString);
    useHarborApi(env.harborConnectionString);

    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: "pht",
            type: "topic"
        }
    });

    const aggregators : {start: () => void}[] = [
        buildDispatcherAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator(),
        buildTrainRouterAggregator()
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
        buildDispatcherComponent()
    ];

    return {
        aggregators,
        components
    }
}

export default createConfig;
