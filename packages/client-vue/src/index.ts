/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { applyPluginBaseOptions } from '@vue-layout/list-controls/core';
import type { App, Component, Plugin } from 'vue';
import * as components from './components';
import type { Options } from './type';
import {
    provideAPIClient,
    provideAuthupAPIClient,
    provideAuthupStore,
    provideSocketManager,
} from './core';

export function install(instance: App, options?: Options) : void {
    options = options || {};

    if (options.apiClient) {
        provideAPIClient(options.apiClient, instance);
    }

    if (options.authupApiClient) {
        provideAuthupAPIClient(options.authupApiClient, instance);
    }

    if (options.authupStore) {
        provideAuthupStore(options.authupStore, instance);
    }

    if (options.socketManager) {
        provideSocketManager(options.socketManager, instance);
    }

    applyPluginBaseOptions(options);

    if (options.components) {
        let componentsSelected : undefined | string[];
        if (typeof options.components !== 'boolean') {
            componentsSelected = options.components;
        }

        Object.entries(components)
            .forEach(([componentName, component]) => {
                if (
                    !Array.isArray(componentsSelected) ||
                    componentsSelected.indexOf(componentName) !== -1
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    instance.component(componentName, component as Component);
                }
            });
    }
}

export default {
    install,
} satisfies Plugin<Options | undefined>;

export * from './components';
export * from './core';
export * from './type';
