/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface LayoutComponentInterface {
    name: string,
    url?: string,
    icon?: string,
    environment?: 'development' | 'production' | 'testing',
    requireLoggedIn?: boolean,
    requirePermissions?: string[],
    requireLoggedOut?: boolean
}

export interface LayoutNavigationComponentInterface extends LayoutComponentInterface {
    id: string
}

export type LayoutSidebarComponentType = 'link' | 'separator';
export interface LayoutSidebarComponentInterface extends LayoutComponentInterface {
    type: LayoutSidebarComponentType,
    components?: LayoutSidebarComponentInterface[],
    rootLink?: boolean
}

export type LayoutComponent = LayoutNavigationComponentInterface | LayoutSidebarComponentInterface;
