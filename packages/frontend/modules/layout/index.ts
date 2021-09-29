/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {LayoutNavigation, LayoutSidebars} from '~/config/layout';
import {
    LayoutComponent,
    LayoutNavigationComponentInterface,
    LayoutSidebarComponentInterface
} from "~/modules/layout/types";

import {AbilityRepresentation, parsePermissionNameToAbilityRepresentation} from "~/modules/auth/utils";
// --------------------------------------------------------------------

const LayoutModule = {
    getNavigation: () : LayoutNavigationComponentInterface[] => {
        return LayoutNavigation;
    },
    getNavigationById: (id: string) : LayoutNavigationComponentInterface | undefined => {
        let index = LayoutNavigation.findIndex((item) => {
            return item.id === id;
        });

        if(index === -1) {
            return undefined;
        }

        return LayoutNavigation[index];
    },
    // --------------------------------------------------------------------

    getSidebarById: (id: string) : LayoutSidebarComponentInterface[] => {
        return id in LayoutSidebars ? LayoutSidebars[id] : LayoutSidebars.default
    },

    // --------------------------------------------------------------------

    reduceComponents: ({ components, loggedIn, can } : { components: LayoutComponent[], loggedIn: boolean, can: CallableFunction}) => {
        return components.filter((component: LayoutComponent ) => {
            if (
                component.hasOwnProperty('requireLoggedIn') &&
                component.requireLoggedIn &&
                !loggedIn
            ) {
                return false
            }

            if (
                component.hasOwnProperty('requireLoggedOut') &&
                component.requireLoggedOut &&
                loggedIn
            ) {
                return false
            }

            if(
                component.hasOwnProperty('requirePermissions') &&
                Array.isArray(component.requirePermissions)
            ) {
                if(component.requirePermissions.length > 0) {
                    for (let i = 0; i < component.requirePermissions.length; i++) {
                        // todo: fix this
                        const ability: AbilityRepresentation = parsePermissionNameToAbilityRepresentation(component.requirePermissions[i]);

                        if (can(ability.action, ability.subject)) {
                            return true;
                        }
                    }

                    return false;
                }
            }

            return true
        })
    }
}

export default LayoutModule;
