/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import { TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { SlotName, hasNormalizedSlot, normalizeSlot } from '@vue-layout/utils';

type Properties = {
    status?: TrainStationApprovalStatus
};

export default Vue.extend<any, any, any, Properties>({
    name: 'TrainStationApprovalStatus',
    props: {
        status: {
            type: String as PropType<TrainStationApprovalStatus>,
            default: undefined,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainStationApprovalStatus.APPROVED:
                    return 'approved';
                case TrainStationApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case 'approved':
                    return 'success';
                case 'rejected':
                    return 'danger';
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

        return h('span', { staticClass: `text-${vm.classSuffix}` }, vm.statusText);
    },
});
