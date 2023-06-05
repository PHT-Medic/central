/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { PropType } from 'vue';
import { ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export default defineComponent({
    name: 'ProposalStationApprovalStatus',
    props: {
        status: {
            type: String as PropType<ProposalStationApprovalStatus>,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const refs = toRefs(props);

        const statusText = computed(() => {
            switch (refs.status.value) {
                case ProposalStationApprovalStatus.APPROVED:
                    return 'approved';
                case ProposalStationApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.status.value) {
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
                classSuffix: classSuffix.value,
                statusText: classSuffix.value,
            }, slots);
        }

        return () => h('span', { class: `text-${classSuffix.value}` }, statusText.value);
    },
});
