import {Environment} from "./env";
import {buildResultAggregator} from "./aggregators/result";
import {buildResultComponent} from "./components/result-image";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    const aggregators : {start: () => void}[] = [
        buildResultAggregator()
    ];

    const components : {start: () => void}[] = [
        buildResultComponent()
    ];

    return {
        aggregators,
        components
    }
}

export default createConfig;
