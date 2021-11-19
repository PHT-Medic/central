/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum Layout {
    NAVIGATION_ID_KEY = 'navigationId',
    REQUIRED_LOGGED_IN_KEY = 'requireLoggedIn',
    REQUIRED_LOGGED_OUT_KEY = 'requireLoggedOut',

    REQUIRED_PERMISSIONS_KEY = 'requirePermissions',
    REQUIRED_ABILITY_KEY = 'requireAbility'
}

export enum LayoutNavigationID {
    ADMIN = 'admin',
    DEFAULT = 'default'
}
