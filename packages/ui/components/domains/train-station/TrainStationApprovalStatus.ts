/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export default defineComponent({
    name: 'TrainStationApprovalStatus',
    props: {
        status: {
            type: String as PropType<TrainStationApprovalStatus>,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const status = toRef(props, 'status');

        const statusText = computed(() => {
            switch (status.value) {
                case TrainStationApprovalStatus.APPROVED:
                    return 'approved';
                case TrainStationApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (status.value) {
                case 'approved':
                    return 'success';
                case 'rejected':
                    return 'danger';
                default:
                    return 'info';
            }
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', {
                classSuffix,
                statusText,
            }, slots);
        }

        return () => h('span', { class: `text-${classSuffix.value}` }, statusText.value);
    },
});
