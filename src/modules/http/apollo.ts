import {ExpressAppInterface} from "./express";
import {Config} from "../../config";
import {ApolloServer} from "apollo-server-express";
import {buildSchemaSync} from "type-graphql";
import {getWritableDirPath} from "../../config/paths";
import path from "path";

interface ApolloServerContext {
    expressApp: ExpressAppInterface
    config: Config
}

function createApolloServer({config, expressApp} : ApolloServerContext) {
    const apolloServer = new ApolloServer({
        schema: buildSchemaSync({
            resolvers: config.graphql.resolvers,
            emitSchemaFile: path.join(getWritableDirPath(), 'schema.gql')
        }),
        playground: true
    });

    apolloServer.applyMiddleware({
        app: expressApp,
        cors: false
    });
}

export default createApolloServer;
