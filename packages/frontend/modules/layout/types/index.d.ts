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
