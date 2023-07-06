/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Slots, VNodeArrayChildren, VNodeProps } from 'vue';
import { BDropdownItem } from 'bootstrap-vue-next';
import { hasNormalizedSlot, normalizeSlot } from '../slot';

type Context = {
    execute() : Promise<void>;
    elementType: 'button' | 'link' | 'dropDownItem',
    withIcon: boolean,
    withText: boolean,
    isAllowed: boolean,
    isDisabled: boolean,
    commandText: string,
    iconClass: string,
    classSuffix: string,
    slots: Slots
};
export function renderActionCommand(ctx: Context) {
    if (!ctx.isAllowed) {
        return h('span', {}, ['']);
    }

    let tag : string;
    const attributes : VNodeProps & Record<string, any> = {
        onClick(event: any) {
            event.preventDefault();

            return ctx.execute();
        },
        disabled: ctx.isDisabled,
    };

    const iconClasses : string[] = [ctx.iconClass, 'pe-1'];

    switch (ctx.elementType) {
        case 'dropDownItem':
            tag = BDropdownItem as any;
            iconClasses.push('ps-1', `text-${ctx.classSuffix}`);
            break;
        case 'link':
            tag = 'a';
            iconClasses.push(`text-${ctx.classSuffix}`);
            break;
        default:
            tag = 'button';
            attributes.type = 'button';
            attributes.class = ['btn', 'btn-xs', `btn-${ctx.classSuffix}`];
            break;
    }

    let text : VNodeArrayChildren = [ctx.commandText];

    if (!ctx.withText) {
        text = [];
    }

    if (ctx.withIcon) {
        text.unshift(h('i', {
            class: iconClasses,
        }));
    }

    if (hasNormalizedSlot('default', ctx.slots)) {
        return normalizeSlot('default', {
            commandText: ctx.commandText,
            isDisabled: ctx.isDisabled,
            isAllowed: ctx.isAllowed,
            iconClass: iconClasses,
        }, ctx.slots);
    }

    return h(tag, attributes, text);
}
