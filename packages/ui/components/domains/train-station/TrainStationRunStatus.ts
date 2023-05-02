/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainStationRunStatus } from '@personalhealthtrain/central-common';
import { computed, defineComponent } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export default defineComponent({
    name: 'TrainStationRunStatus',
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    setup(props, { slots }) {
        const refs = toRefs(props);

        const statusText = computed(() => {
            switch (refs.status.value) {
                case TrainStationRunStatus.ARRIVED:
                    return 'arrived';
                case TrainStationRunStatus.DEPARTED:
                    return 'departed';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.status.value) {
                case TrainStationRunStatus.ARRIVED:
                    return 'primary';
                case TrainStationRunStatus.DEPARTED:
                    return 'success';
                default:
                    return 'info';
            }
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', { classSuffix, statusText }, slots);
        }

        return () => h('span', {
            class: `text-${classSuffix.value}`,
        }, [statusText.value]);
    },
});
