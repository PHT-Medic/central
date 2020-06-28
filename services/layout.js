import layout from './../config/layout'

// --------------------------------------------------------------------

const requireLoggedInKey = 'requireLoggedIn';
const requireLoggedOutKey = 'requireLoggedOut';
const requireAbilityKey = 'requireAbility';

// --------------------------------------------------------------------

const LayoutService = {
    getNavigation: () => {
        return layout.navigation
    },
    // --------------------------------------------------------------------

    getSidebarById: (id) => {
        return id in layout.sidebars ? layout.sidebars[id] : layout.sidebars.default
    },
    getNavigationById: (id) => {
        let index = layout.navigation.findIndex((item) => {
            return item.hasOwnProperty('navigationId') && item.navigationId === id;
        })

        if(index === -1) {
            throw new Error('Das Navigationselement konnte nicht gefunden werden.');
        }

        return layout.navigation[index];
    },

    // --------------------------------------------------------------------

    reduceComponents: ({ components, loggedIn, can }) => {
        return components.filter((component) => {
            if (
                component.hasOwnProperty(requireLoggedInKey) &&
                component[requireLoggedInKey] &&
                !loggedIn
            ) {
                return false
            }

            if (
                component.hasOwnProperty(requireLoggedOutKey) &&
                component[requireLoggedOutKey] &&
                loggedIn
            ) {
                return false
            }

            if (
                component.hasOwnProperty(requireAbilityKey) &&
                component[requireAbilityKey] &&
                typeof component[requireAbilityKey] === 'function' &&
                !component[requireAbilityKey](can)
            ) {
                return false
            }

            return true
        })
    }
}

export { LayoutService }
