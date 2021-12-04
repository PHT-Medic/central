/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    NavigationComponentConfig,
    NavigationComponentTier,
    NavigationProviderContext,
    NavigationProviderInterface,
    applyAuthRestrictionForNavigationComponents,
} from 'vue-layout-navigation';
import { Context } from '@nuxt/types';
import { LayoutSideAdminNavigation, LayoutSideDefaultNavigation, LayoutTopNavigation } from './index';
import { LayoutKey } from './contants';

export class NavigationProvider implements NavigationProviderInterface {
    protected ctx: Context;

    // -------------------------

    protected primaryItems : NavigationComponentConfig[] = LayoutTopNavigation;

    protected secondaryDefaultItems : NavigationComponentConfig[] = LayoutSideDefaultNavigation;

    protected secondaryAdminItems : NavigationComponentConfig[] = LayoutSideAdminNavigation;

    // -------------------------

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    // ---------------------------

    async getComponent(tier: NavigationComponentTier, id: string, context: NavigationProviderContext): Promise<NavigationComponentConfig | undefined> {
        const components = await this.getComponents(tier, context);
        if (components.length === 0) {
            return undefined;
        }

        const index = components.findIndex((component) => component.id === id);
        if (index === -1) {
            return undefined;
        }

        return components[index];
    }

    async getComponents(tier: NavigationComponentTier, context: NavigationProviderContext): Promise<NavigationComponentConfig[]> {
        if (!await this.hasTier(tier)) {
            return [];
        }

        let items : NavigationComponentConfig[] = [];

        switch (tier) {
            case 0:
                items = this.primaryItems;
                break;
            case 1:
                const id = context.components.length >= 1
                    ? context.components[0].id ?? 'default'
                    : 'default';

                switch (id) {
                    case 'default':
                        items = this.secondaryDefaultItems;
                        break;
                    case 'admin':
                        items = this.secondaryAdminItems;
                        break;
                }

                break;
        }

        return applyAuthRestrictionForNavigationComponents(items, {
            loggedIn: this.ctx.store.getters['auth/loggedIn'],
            auth: this.ctx.$auth,
            layoutKey: {
                requiredAbilities: LayoutKey.REQUIRED_ABILITIES,
                requiredPermissions: LayoutKey.REQUIRED_PERMISSIONS,
                requiredLoggedIn: LayoutKey.REQUIRED_LOGGED_IN,
                requiredLoggedOut: LayoutKey.REQUIRED_LOGGED_OUT,
            },
        });
    }

    async hasTier(tier: NavigationComponentTier): Promise<boolean> {
        return [0, 1].indexOf(tier) !== -1;
    }

    async getContextForUrl(url: string): Promise<NavigationProviderContext | undefined> {
        const context : NavigationProviderContext = {
            components: [],
        };

        const sortFunc = (a: NavigationComponentConfig, b: NavigationComponentConfig) => (b.url?.length ?? 0) - (a.url?.length ?? 0);
        const filterFunc = (item: NavigationComponentConfig) => !!item.url && (url.startsWith(item.url) || url === item.url);

        // ------------------------

        const secondaryDefaultItems = this.flattenNestedComponents(this.secondaryDefaultItems)
            .sort(sortFunc)
            .filter(filterFunc);
        const secondaryAdminItems = this.flattenNestedComponents(this.secondaryAdminItems)
            .sort(sortFunc)
            .filter(filterFunc);

        if (
            secondaryDefaultItems.length === 0
            && secondaryAdminItems.length === 0
        ) {
            return context;
        }

        const isAdminItem = secondaryAdminItems.length > 0;
        const secondaryItem : NavigationComponentConfig = isAdminItem ? secondaryAdminItems[0] : secondaryDefaultItems[0];

        const primaryItem = this.primaryItems.filter((item) => !!item?.id && item.id === (isAdminItem ? 'admin' : 'default')).pop();

        if (typeof primaryItem === 'undefined') {
            return context;
        }

        context.components.push(primaryItem);
        context.components.push(secondaryItem);

        return context;
    }

    // ----------------------------------------------------

    private flattenNestedComponents(components: NavigationComponentConfig[]) : NavigationComponentConfig[] {
        const output = [...components];

        components.map((component) => {
            if (component.components) {
                output.push(...this.flattenNestedComponents(component.components));
            }
        });

        return output;
    }
}
