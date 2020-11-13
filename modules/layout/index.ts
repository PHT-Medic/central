import {LayoutNavigation, LayoutSidebars} from '~/config/layout';
import {
    LayoutComponent,
    LayoutNavigationComponentInterface,
    LayoutSidebarComponentInterface
} from "~/modules/layout/types";
// --------------------------------------------------------------------

const LayoutModule = {
    getNavigation: () : LayoutNavigationComponentInterface[] => {
        return LayoutNavigation;
    },
    getNavigationById: (id: string) : LayoutNavigationComponentInterface => {
        let index = LayoutNavigation.findIndex((item) => {
            return item.id === id;
        });

        if(index === -1) {
            throw new Error('Das Navigationselement konnte nicht gefunden werden.');
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

            if (
                component.hasOwnProperty('requireAbility') &&
                typeof component.requireAbility === 'function'
            ) {
                if(!component.requireAbility(can)) {
                    return false;
                }
            }

            return true
        })
    }
}

export default LayoutModule;
