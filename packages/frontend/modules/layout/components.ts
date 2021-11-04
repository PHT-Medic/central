/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {AbilityMeta, buildAbilityMetaFromName} from "@typescript-auth/core";
import AuthModule from "../auth";
import {Layout} from "./contants";
import {
    LayoutComponent,
    LayoutNavigationComponent,
    LayoutSidebarComponent
} from "./types";

type ReduceComponentContext = {
    loggedIn: boolean,
    auth: AuthModule
}

export function reduceComponents(
    components: LayoutComponent[],
    context: ReduceComponentContext
) : LayoutComponent[] {
    return components
        .filter((component: LayoutComponent) => {
            if (
                component.hasOwnProperty(Layout.REQUIRED_LOGGED_IN_KEY) &&
                component[Layout.REQUIRED_LOGGED_IN_KEY] &&
                !context.loggedIn
            ) {
                return false
            }

            if (
                component.hasOwnProperty(Layout.REQUIRED_LOGGED_OUT_KEY) &&
                component[Layout.REQUIRED_LOGGED_OUT_KEY] &&
                context.loggedIn
            ) {
                return false
            }

            const keys : string[] = [
                Layout.REQUIRED_PERMISSIONS_KEY,
                Layout.REQUIRED_ABILITY_KEY
            ];

            for(let i=0; i<keys.length; i++) {
                if(!component.hasOwnProperty(keys[i])) {
                    continue;
                }

                const required = component[keys[i]];

                if(
                    Array.isArray(required) &&
                    required.length > 0
                ) {
                    const abilities : AbilityMeta[] = keys[i] === Layout.REQUIRED_PERMISSIONS_KEY ?
                        required.map(permission => buildAbilityMetaFromName(permission)) :
                        required;

                    return abilities.some(ability => context.auth.can(ability.action, ability.subject));
                }

                if(typeof required === 'function') {
                    return required(context.auth);
                }
            }
            return true;
        })
        .map(component => {
            if(component.components) {
                component.components = reduceComponents(component.components, context) as LayoutNavigationComponent[] | LayoutSidebarComponent[];
            }

            return component;
        });
}
