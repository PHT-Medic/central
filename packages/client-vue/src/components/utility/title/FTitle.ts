/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import { ATitle } from '@authup/client-vue';

export const FTitle = defineComponent({
    props: {
        icon: {
            type: Boolean,
            default: true,
        },
        iconPosition: {
            type: String as PropType<'start' | 'end'>,
        },
        iconClass: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    slots: Object as SlotsType<{
        default: Record<string, any>
    }>,
    setup(props, { slots }) {
        return () => h(ATitle, {
            slots,
            icon: props.icon,
            iconClass: props.iconClass,
            iconPosition: props.iconPosition,
            text: props.text,
        });
    },
});
