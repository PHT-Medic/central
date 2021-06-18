import {User} from "../../../../../../domains/user";
import {Service} from "../../../../../../domains/service";
import {AuthorizationClientType} from "../index";

export interface AuthorizationParserResult {
    type: AuthorizationClientType,
    entity: User | Service,
    remoteAddress?: string
}
