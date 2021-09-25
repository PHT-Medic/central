import {setConfig} from "amqp-extension";
import {buildCommandRouterComponent} from "./components/command-router";
import {Environment} from "./env";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
}

function createConfig({env} : ConfigContext) : Config {
    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: "pht",
            type: "topic"
        }
    });

    const aggregators : {start: () => void}[] = [
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent()
    ];

    return {
        aggregators,
        components
    }
}

export default createConfig;
