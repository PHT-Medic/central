const adminNavigationId = 'admin';
const defaultNavigationId = 'default';

export {
    adminNavigationId,
    defaultNavigationId
}

export default {
    navigation: [
        {
            name: 'Home',
            value: null,
            icon: 'fa fa-home',
            navigationId: defaultNavigationId
        },
        {
            name: 'Admin',
            value: null,
            icon: 'fas fa-cog',
            navigationId: adminNavigationId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('use','admin_ui');
            }
        }
    ],
    sidebars: {
        admin: [
            {
                name: 'Allgemein',
                type: 'separator',
                requireLoggedIn: true
            },
            {
                name: 'Dashboard',
                type: 'link',
                value: '/admin',
                icon: 'fas fa-tachometer-alt',
                subcomponents: false,
                requireLoggedIn: true
            },
            {
                name: 'Benutzer',
                type: 'separator',
                requireLoggedIn: true,
                requireAbility: (can) => {
                    return can('add','user') || can('drop','user') || can('edit','user') || can('add','user_permission') || can('drop','user_permission');
                }
            },
            {
                name: 'Benutzer',
                type: 'link',
                value: '/admin/users',
                icon: 'fas fa-user',
                subcomponents: false,
                requireLoggedIn: true,
                requireAbility: (can) => {
                    return can('add','user') || can('drop','user') || can('edit','user') || can('add','user_permission') || can('drop','user_permission');
                }
            },
            /*
            {
                name: 'Gruppen',
                type: 'link',
                value: '/admin/groups',
                icon: 'fas fa-users',
                subcomponents: false,
                requireLoggedIn: true
            },
             */
            {
                name: 'Berechtingungen',
                type: 'separator',
                requireLoggedIn: true,
                requireAbility: (can) => {
                    return can('add','permission') || can('drop','permission');
                }
            },
            {
                name: 'Berechtigungen',
                type: 'link',
                value: '/admin/permissions',
                icon: 'fas fa-key',
                subcomponents: false,
                requireLoggedIn: true,
                requireAbility: (can) => {
                    return can('add','permission') || can('drop','permission');
                }
            },
        ],
        default: [
            {
                name: 'Allgemein',
                type: 'separator',
                requireLoggedIn: true
            },
            {
                name: 'Dashboard',
                type: 'link',
                value: '/',
                icon: 'fas fa-tachometer-alt',
                subcomponents: false,
                requireLoggedIn: true
            },
            {
                name: 'Antrag',
                type: 'separator',
                requireLoggedIn: true
            },
            {
                name: 'Antrag erstellen',
                type: 'link',
                value: '/proposals/add',
                icon: 'fas fa-plus',
                subcomponents: false,
                requireLoggedIn: true
            },
            {
                name: 'Anträge',
                type: 'link',
                value: '/proposals',
                icon: 'fas fa-bars',
                subcomponents: false,
                requireLoggedIn: true
            },
            {
                name: 'Sonstige',
                type: 'separator'
            },
            {
                name: 'Login',
                type: 'link',
                value: '/login',
                icon: 'fas fa-sign',
                subcomponents: false,
                requireLoggedOut: true
            },
            {
                name: 'Einstellungen',
                type: 'link',
                value: '/settings',
                icon: 'fas fa-cog',
                subcomponents: false,
                requireLoggedIn: true,
                requireLoggedOut: false
            }
        ]
    }
};
