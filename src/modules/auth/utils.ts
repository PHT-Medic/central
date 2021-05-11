import { camelCase } from 'change-case';
import {User} from "../../domains/user";

export interface AbilityRepresentation {
    action: string,
    subject: string
}

export function parsePermissionNameToAbilityRepresentation(name: string) : AbilityRepresentation {
    let parts : string[] = name.split('_');
    let action : string | undefined = parts.pop();
    let subject : string = camelCase(parts.join('_'));

    if(typeof action === 'undefined') {
        throw new Error('Permission name not valid.');
    }

    return {
        action,
        subject
    }
}

export function isPermittedToOperateOnRealmResource(sessionUser: User | undefined, resource: {[key: string] : any}) {
    if(typeof sessionUser === 'undefined') {
        return false;
    }

    if(sessionUser.realm_id === 'master') {
        return true;
    }

    const realmIdKey = 'realm_id';

    if(!resource.hasOwnProperty(realmIdKey)) {
        return false;
    }

    return resource[realmIdKey] === sessionUser.realm_id
}
