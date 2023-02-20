/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, VNodeChildren, VNodeData } from 'vue';
import { BDropdownItem } from 'bootstrap-vue';
import type { TrainCommandProperties } from '../domains/train/command/type';
import type { ActionCommandMethods } from './type';

export function renderActionCommand(
    vm: TrainCommandProperties & ActionCommandMethods & {
        isAllowed: boolean,
        isDisabled: boolean,
        commandText: string,
        iconClass: string,
        classSuffix: string,
        $scopedSlots: Record<string, any>
    },
    h: CreateElement,
) {
    if (!vm.isAllowed) {
        return h('span', {}, ['']);
    }

    let tag;
    const attributes : VNodeData = {
        on: {
            click(event) {
                event.preventDefault();

                vm.do.call(null);
            },
        },
        props: {
            disabled: vm.isDisabled,
        },
        domProps: {
            disabled: vm.isDisabled,
        },
        attrs: {
            disabled: vm.isDisabled,
        },
    };

    const iconClasses : string[] = [vm.iconClass, 'pr-1'];

    switch (vm.elementType) {
        case 'dropDownItem':
            tag = BDropdownItem;
            iconClasses.push('pl-1', `text-${vm.classSuffix}`);
            break;
        case 'link':
            tag = 'a';
            iconClasses.push(`text-${vm.classSuffix}`);
            break;
        default:
            tag = 'button';
            attributes.attrs.type = 'button';
            attributes.class = ['btn', 'btn-xs', `btn-${vm.classSuffix}`];
            break;
    }

    let text : VNodeChildren = [vm.commandText];

    if (!vm.withText) {
        text = [];
    }

    if (vm.withIcon) {
        text.unshift(h('i', {
            class: iconClasses,
        }));
    }

    if (typeof vm.$scopedSlots.default === 'function') {
        vm.$scopedSlots.default({
            commandText: vm.commandText,
            isDisabled: vm.isDisabled,
            isAllowed: vm.isAllowed,
            iconClass: iconClasses,
        });
    }

    return h(tag, attributes, text);
}
