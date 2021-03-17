import {parseHarborConnectionString} from "../../../api/provider/harbor";
import env from "../../../../env";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);

function parseAsServiceToken(token: string) : {id: string} {
    if(harborConfig.token === token) {
        return {
            id: 'harbor'
        }
    }

    throw new Error('Es konnte kein Dienst zu dem Token assoziert werden.');
}

export async function checkAuthenticated(req: any, res: any, next: any) {
    let { authorization } = req.headers;

    if(typeof authorization === "string") {
        const parts : string[] = authorization.split(" ");

        if(parts.length < 2) {
            return res._failUnauthorized({message: 'Der angegebene Token ist in keinem gültigen Format.', code: 'invalid_token'});
        }

        req.token = parts[1];

        let parsed : boolean = false;
        let parseError : string | undefined;

        try {
            req.service = parseAsServiceToken(req.token);
            req.serviceId = req.service.id;
            parsed = true;
        } catch (e) {
            parseError = e.message;
        }

        if(!parsed) {
            return res._failUnauthorized({message: parseError, code: 'invalid_token'});
        }
    }

    next();
}

export async function forceLoggedIn(req: any, res: any, next: any) {
    if(typeof req.serviceId === 'undefined') {
        res._failUnauthorized({message: 'Sie müssen angemeldet sein.'});
        return;
    }

    next();
}
