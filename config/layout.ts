import {
    LayoutNavigationComponentInterface,
    LayoutSidebarComponentInterface
} from "~/modules/layout/types";

const LayoutNavigationAdminId : string = 'admin';
const LayoutNavigationDefaultId : string = 'default';

export {
    LayoutNavigationAdminId,
    LayoutNavigationDefaultId
}

export const LayoutNavigation : LayoutNavigationComponentInterface[] = [
    {
        id: LayoutNavigationDefaultId,
        name: 'Home',
        icon: 'fa fa-home',
    },
    {
        id: LayoutNavigationAdminId,
        name: 'Admin',
        icon: 'fas fa-cog',
        requireLoggedIn: true,
        requireAbility: (can: any) => {
            return can('use','admin_ui');
        }
    }
];

export const LayoutSidebars : {[key: string] : LayoutSidebarComponentInterface[]} = {
    admin: [
        {
            name: 'Allgemein',
            type: 'separator',
            requireLoggedIn: true
        },
        {
            name: 'Dashboard',
            type: 'link',
            url: '/admin',
            icon: 'fas fa-tachometer-alt',
            requireLoggedIn: true
        },
        {
            name: 'Benutzer & Gruppen',
            type: 'separator',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','user') || can('drop','user') || can('edit','user') ||
                    can('add','role') || can('drop','role') || can('edit','role') || can('add','role_permission') || can('drop','role_permission');
            }
        },
        {
            name: 'Benutzer',
            type: 'link',
            url: '/admin/users',
            icon: 'fas fa-user',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','user') || can('drop','user') || can('edit','user');
            }
        },
        {
            name: 'Rollen',
            type: 'link',
            url: '/admin/roles',
            icon: 'fas fa-users',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','role') || can('drop','role') || can('edit','role') || can('add','role_permission') || can('drop','role_permission');
            }
        },
        {
            name: 'Berechtingungen',
            type: 'separator',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','permission') || can('drop','permission');
            }
        },
        {
            name: 'Berechtigungen',
            type: 'link',
            url: '/admin/permissions',
            icon: 'fas fa-key',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','permission') || can('drop','permission');
            }
        },
        {
            name: 'PHT',
            type: 'separator',
            requireLoggedIn: true
        },
        {
            name: 'Stationen',
            type: 'link',
            url: '/admin/stations',
            icon: 'fas fa-train',
            requireLoggedIn: true,
            requireAbility: (can: any) => {
                return can('add','station') || can('drop','station') || can('edit', 'station');
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
            url: '/',
            icon: 'fas fa-tachometer-alt',
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
            url: '/proposals/add',
            icon: 'fas fa-plus',
            requireLoggedIn: true
        },
        {
            name: 'Anträge',
            type: 'link',
            url: '/proposals',
            icon: 'fas fa-bars',
            requireLoggedIn: true
        },
        {
            name: 'Sonstige',
            type: 'separator'
        },
        {
            name: 'Login',
            type: 'link',
            url: '/login',
            icon: 'fas fa-sign',
            requireLoggedOut: true
        },
        {
            name: 'Einstellungen',
            type: 'link',
            url: '/settings',
            icon: 'fas fa-cog',
            requireLoggedIn: true,
            requireLoggedOut: false
        }
    ]

};
