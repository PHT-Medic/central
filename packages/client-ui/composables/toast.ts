/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@personalhealthtrain/core';
import { useToast as _useToast } from 'bootstrap-vue-next';

type ColorVariant = 'primary' |
'secondary' |
'success' |
'danger' |
'warning' |
'info' |
'light' |
'dark';

type ContainerVerticalAlign = 'top' | 'bottom' | 'middle';
type ContainerHorizontalAlign = 'left' | 'center' | 'right';
type ContainerPosition = `${ContainerVerticalAlign}-${ContainerHorizontalAlign}`;
type ToastOptions = {
    pos?: ContainerPosition,
    body: string,
    variant?: ColorVariant
};

export function useToast() {
    const toast = _useToast();

    return {
        hide(el: symbol) {
            toast.hide(el);
        },
        show(el: string | ToastOptions, options?: Omit<ToastOptions, 'body'>) {
            if (isObject(el)) {
                el.pos = el.pos || 'top-center';
                return toast.show(el);
            }

            if (options) {
                options.pos = options.pos || 'top-center';
            }

            return toast.show(el, options);
        },
    };
}
