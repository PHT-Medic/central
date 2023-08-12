/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component,
} from 'vue';
import {
    defineComponent, getCurrentInstance, h, resolveDynamicComponent,
} from 'vue';

export default defineComponent({
    inheritAttrs: true,
    emits: ['click', 'clicked'],
    setup(props, { attrs, slots }) {
        const instance = getCurrentInstance();

        let tag : string | Component;

        if (
            instance &&
            typeof instance.appContext.app.component('BDropdown') !== 'undefined'
        ) {
            tag = resolveDynamicComponent('BDropdown') as Component;
        } else {
            tag = 'div';
        }

        return () => h(
            tag as string,
            { ...attrs },
            {
                default: () => (typeof slots.default === 'function' ? slots.default() : []),
            },
        );
    },
});
