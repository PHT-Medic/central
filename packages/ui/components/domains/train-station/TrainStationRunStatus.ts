/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainStationRunStatus } from '@personalhealthtrain/central-common';
import type { CreateElement, VNode } from 'vue';
import Vue from 'vue';
import { SlotName, hasNormalizedSlot, normalizeSlot } from '@vue-layout/utils';

export default Vue.extend({
    name: 'TrainStationRunStatus',
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainStationRunStatus.ARRIVED:
                    return 'arrived';
                case TrainStationRunStatus.DEPARTED:
                    return 'departed';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainStationRunStatus.ARRIVED:
                    return 'primary';
                case TrainStationRunStatus.DEPARTED:
                    return 'success';
                default:
                    return 'info';
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        if (hasNormalizedSlot(SlotName.DEFAULT, vm.$scopedSlots, vm.$slots)) {
            return normalizeSlot(SlotName.DEFAULT, {
                classSuffix: vm.classSuffix,
                statusText: vm.statusText,
            }, vm.$scopedSlots, vm.$slots);
        }

        return h('span', {
            staticClass: `text-${vm.classSuffix}`,
        }, [vm.statusText]);
    },
});
