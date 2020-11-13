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
        requirePermissions: ['admin_ui_use']
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
            requirePermissions: ['user_add', 'user_drop', 'user_edit', 'role_add', 'role_drop', 'role_edit', 'role_permission_add', 'role_permission_drop']
        },
        {
            name: 'Benutzer',
            type: 'link',
            url: '/admin/users',
            icon: 'fas fa-user',
            requireLoggedIn: true,
            requirePermissions: ['user_add', 'user_drop', 'user_edit']
        },
        {
            name: 'Rollen',
            type: 'link',
            url: '/admin/roles',
            icon: 'fas fa-users',
            requireLoggedIn: true,
            requirePermissions: ['role_add', 'role_drop', 'role_edit', 'role_permission_add', 'role_permission_drop']
        },
        {
            name: 'Berechtingungen',
            type: 'separator',
            requireLoggedIn: true,
            requirePermissions: ['permission_add', 'permission_drop']
        },
        {
            name: 'Berechtigungen',
            type: 'link',
            url: '/admin/permissions',
            icon: 'fas fa-key',
            requireLoggedIn: true,
            requirePermissions: ['permission_add', 'permission_drop']
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
            requirePermissions: ['station_add', 'station_drop', 'station_edit']
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
