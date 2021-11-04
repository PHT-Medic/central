/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {LayoutNavigationComponent, LayoutSidebarComponent} from "../modules/layout/types";
import {Layout, LayoutNavigationID} from "../modules/layout/contants";
import {PermissionID} from "@personalhealthtrain/ui-common";

export const LayoutNavigation : LayoutNavigationComponent[] = [
    {
        id: LayoutNavigationID.DEFAULT,
        name: 'Home',
        icon: 'fa fa-home',
    },
    {
        id: LayoutNavigationID.ADMIN,
        name: 'Admin',
        icon: 'fas fa-cog',
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [PermissionID.ADMIN_UI_USE]
    }
];

type LayoutSidebarGroup = {
    [K in LayoutNavigationID]: LayoutSidebarComponent[]
}

export const LayoutSidebars : LayoutSidebarGroup = {
    admin: [
        {
            name: 'General',
            type: 'separator',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true
        },
        {
            name: 'Realms',
            type: 'link',
            url: '/admin/realms',
            icon: 'fas fa-university',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.REALM_ADD,
                PermissionID.REALM_EDIT,
                PermissionID.REALM_DROP,

                PermissionID.PROVIDER_ADD,
                PermissionID.PROVIDER_DROP,
                PermissionID.PROPOSAL_EDIT
            ]
        },
        {
            name: 'Users',
            type: 'link',
            url: '/admin/users',
            icon: 'fas fa-user',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.USER_ADD,
                PermissionID.USER_EDIT,
                PermissionID.USER_DROP
            ]
        },
        {
            name: 'Roles',
            type: 'link',
            url: '/admin/roles',
            icon: 'fas fa-users',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.ROLE_ADD,
                PermissionID.ROLE_EDIT,
                PermissionID.ROLE_DROP,

                PermissionID.ROLE_PERMISSION_ADD,
                PermissionID.ROLE_PERMISSION_DROP
            ]
        },
        {
            name: 'Permissions',
            type: 'link',
            url: '/admin/permissions',
            icon: 'fas fa-key',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.PERMISSION_MANAGE
            ]
        },
        {
            name: 'Services',
            type: 'link',
            url: '/admin/services',
            icon: 'fas fa-concierge-bell',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.SERVICE_MANAGE
            ]
        }
    ],
    default: [
        {
            name: 'General',
            type: 'separator',
            requireLoggedIn: true
        },
        {
            name: 'Info',
            type: 'link',
            url: '/',
            icon: 'fas fa-info',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            rootLink: true
        },
        {
            name: 'Proposals',
            type: 'link',
            url: '/proposals',
            icon: 'fas fa-file',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
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
                PermissionID.TRAIN_EXECUTION_STOP
                ]
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
                PermissionID.TRAIN_EXECUTION_STOP
            ]
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
            [Layout.REQUIRED_LOGGED_OUT_KEY]: true,
        },
        {
            name: 'Settings',
            type: 'link',
            url: '/settings',
            icon: 'fas fa-cog',
            [Layout.REQUIRED_LOGGED_IN_KEY]: true
        }
    ]

};
