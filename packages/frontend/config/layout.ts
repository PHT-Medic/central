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

const RouteProposalsPermissions = [
    'proposal_edit',
    'proposal_drop',
    'train_add',
    'train_drop',
    'train_result_read',
    'train_execution_start',
    'train_execution_stop'
];

const RouteAdminPHTStationsPermissions = [
    'station_add',
    'station_drop',
    'station_edit'
];

export const LayoutSidebars : {[key: string] : LayoutSidebarComponentInterface[]} = {
    admin: [
        {
            name: 'General',
            type: 'separator',
            requireLoggedIn: true
        },
        {
            name: 'Dashboard',
            type: 'link',
            url: '/admin',
            icon: 'fas fa-tachometer-alt',
            requireLoggedIn: true,
            rootLink: true
        },
        {
            name: 'Realms',
            type: 'link',
            url: '/admin/realms',
            icon: 'fas fa-university',
            requireLoggedIn: true,
            requirePermissions: ['realm_add', 'realm_drop', 'realm_edit', 'provider_add', 'provider_drop', 'provider_edit','station_edit','station_drop','station_add']
        },
        {
            name: 'Users',
            type: 'link',
            url: '/admin/users',
            icon: 'fas fa-user',
            requireLoggedIn: true,
            requirePermissions: ['user_add', 'user_drop', 'user_edit']
        },
        {
            name: 'Roles',
            type: 'link',
            url: '/admin/roles',
            icon: 'fas fa-users',
            requireLoggedIn: true,
            requirePermissions: ['role_add', 'role_drop', 'role_edit', 'role_permission_add', 'role_permission_drop']
        },
        {
            name: 'Permissions',
            type: 'link',
            url: '/admin/permissions',
            icon: 'fas fa-key',
            requireLoggedIn: true,
            requirePermissions: ['permission_add', 'permission_drop']
        },
        {
            name: 'Services',
            type: 'link',
            url: '/admin/services',
            icon: 'fas fa-concierge-bell',
            requireLoggedIn: true,
            requirePermissions: ['service_manage']
        }
    ],
    default: [
        {
            name: 'General',
            type: 'separator',
            requireLoggedIn: true
        },
        {
            name: 'Dashboard',
            type: 'link',
            url: '/',
            icon: 'fas fa-tachometer-alt',
            requireLoggedIn: true,
            rootLink: true
        },
        {
            name: 'Proposals',
            type: 'link',
            url: '/proposals',
            icon: 'fas fa-file',
            requireLoggedIn: true,
            requirePermissions: [...RouteProposalsPermissions, 'proposal_add', 'proposal_approve']
        },
        {
            name: 'Trains',
            type: 'link',
            url: '/trains',
            icon: 'fas fa-train',
            requireLoggedIn: true,
            requirePermissions: ['train_execution_start', 'train_execution_stop', 'train_edit', 'train_drop', 'train_add']
        },
        {
            name: 'Others',
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
            name: 'Settings',
            type: 'link',
            url: '/settings',
            icon: 'fas fa-cog',
            requireLoggedIn: true,
            requireLoggedOut: false
        }
    ]

};
