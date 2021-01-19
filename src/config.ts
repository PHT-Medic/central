import {Environment} from "./env";
import {buildTrainBuilderAggregator} from "./aggregators/train-builder";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    const aggregators : {start: () => void}[] = [
        buildTrainBuilderAggregator()
    ];

    const components : {start: () => void}[] = [

    ];

    return {
        aggregators,
        components
    }
}

export default createConfig;
