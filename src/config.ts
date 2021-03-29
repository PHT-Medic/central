import {Environment} from "./env";
import {buildTrainBuilderAggregator} from "./aggregators/train-builder";
import {buildTrainResultAggregator} from "./aggregators/train-result";
import {buildHarborAggregator} from "./aggregators/harbor";
import {NonEmptyArray} from "type-graphql/dist/interfaces/NonEmptyArray";
import {HelloWorldResolver} from "./app/graphql/resolvers/HelloWorldResolver";
import {UserResolver} from "./app/graphql/resolvers/UserResolver";

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[],
    graphql: {
        // tslint:disable-next-line:ban-types
        resolvers: NonEmptyArray<Function> | NonEmptyArray<string>
    }
}

function createConfig({env} : ConfigContext) : Config {
    const aggregators : {start: () => void}[] = [
        buildHarborAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator()
    ];

    const components : {start: () => void}[] = [

    ];

    const graphql : {
        // tslint:disable-next-line:ban-types
        resolvers: NonEmptyArray<Function> | NonEmptyArray<string>
    } = {
        resolvers: [
            HelloWorldResolver,
            UserResolver
        ]
    }

    return {
        aggregators,
        components,
        graphql
    }
}

export default createConfig;
