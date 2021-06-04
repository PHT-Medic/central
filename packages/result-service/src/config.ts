import {Environment} from "./env";
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
