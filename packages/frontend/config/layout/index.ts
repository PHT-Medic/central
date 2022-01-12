/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NavigationComponentConfig } from 'vue-layout-navigation';
import { PermissionID } from '@personalhealthtrain/ui-common';
import { LayoutKey, LayoutNavigationID } from './contants';

export const LayoutTopNavigation : NavigationComponentConfig[] = [
    {
        id: LayoutNavigationID.DEFAULT,
        name: 'Home',
        icon: 'fa fa-home',
    },
    {
        id: LayoutNavigationID.ADMIN,
        name: 'Admin',
        icon: 'fas fa-cog',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [],
    },
];

export const LayoutSideDefaultNavigation : NavigationComponentConfig[] = [
    {
        name: 'Info',
        type: 'link',
        url: '/',
        icon: 'fas fa-info',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        rootLink: true,
    },
    {
        name: 'Proposals',
        type: 'link',
        url: '/proposals',
        icon: 'fas fa-file',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
            PermissionID.PROPOSAL_DROP,
            PermissionID.PROPOSAL_EDIT,
            PermissionID.PROPOSAL_APPROVE,

            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_DROP,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_APPROVE,

            PermissionID.TRAIN_RESULT_READ,
            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
        ],
    },
    {
        name: 'Trains',
        type: 'link',
        url: '/trains',
        icon: 'fas fa-train',
        requireLoggedIn: true,
        requirePermissions: [
            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_DROP,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_APPROVE,

            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
        ],
    },
    {
        name: 'Others',
        type: 'separator',
    },
    {
        name: 'Login',
        type: 'link',
        url: '/login',
        icon: 'fas fa-sign',
        [LayoutKey.REQUIRED_LOGGED_OUT]: true,
    },
    {
        name: 'Settings',
        type: 'link',
        url: '/settings',
        icon: 'fas fa-cog',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
];

export const LayoutSideAdminNavigation : NavigationComponentConfig[] = [
    {
        name: 'Auth',
        type: 'link',
        icon: 'fas fa-lock',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_ADD,
            PermissionID.REALM_EDIT,
            PermissionID.REALM_DROP,

            PermissionID.USER_ADD,
            PermissionID.USER_EDIT,
            PermissionID.USER_DROP,

            PermissionID.ROLE_ADD,
            PermissionID.ROLE_EDIT,
            PermissionID.ROLE_DROP,
            PermissionID.ROLE_PERMISSION_ADD,
            PermissionID.ROLE_PERMISSION_DROP,

            PermissionID.PERMISSION_ADD,
            PermissionID.PERMISSION_EDIT,
            PermissionID.PERMISSION_DROP,
        ],
        components: [
            {
                name: 'Realms',
                type: 'link',
                url: '/admin/realms',
                icon: 'fas fa-university',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionID.REALM_ADD,
                    PermissionID.REALM_EDIT,
                    PermissionID.REALM_DROP,

                    PermissionID.PROVIDER_ADD,
                    PermissionID.PROVIDER_DROP,
                    PermissionID.PROPOSAL_EDIT,
                ],
            },
            {
                name: 'Users',
                type: 'link',
                url: '/admin/users',
                icon: 'fas fa-user',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionID.USER_ADD,
                    PermissionID.USER_EDIT,
                    PermissionID.USER_DROP,
                ],
            },
            {
                name: 'Roles',
                type: 'link',
                url: '/admin/roles',
                icon: 'fas fa-users',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionID.ROLE_ADD,
                    PermissionID.ROLE_EDIT,
                    PermissionID.ROLE_DROP,

                    PermissionID.ROLE_PERMISSION_ADD,
                    PermissionID.ROLE_PERMISSION_DROP,
                ],
            },
            {
                name: 'Permissions',
                type: 'link',
                url: '/admin/permissions',
                icon: 'fas fa-key',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionID.PERMISSION_ADD,
                    PermissionID.PERMISSION_EDIT,
                    PermissionID.PERMISSION_DROP,
                ],
            },
        ],
    },
    {
        name: 'General',
        type: 'link',
        icon: 'fas fa-globe',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.SERVICE_MANAGE,
        ],
        components: [
            {
                name: 'Services',
                type: 'link',
                url: '/admin/services',
                icon: 'fas fa-concierge-bell',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionID.SERVICE_MANAGE,
                ],
            },
        ],
    },

];
