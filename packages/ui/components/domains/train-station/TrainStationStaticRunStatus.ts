/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainBuildStatus, TrainRunStatus, TrainStationStatic } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export default defineComponent({
    props: {
        id: {
            // incoming, outgoing
            type: String as PropType<'incoming' | 'outgoing'>,
            default: null,
        },
        trainBuildStatus: {
            type: String,
            default: null,
        },
        trainRunStatus: {
            type: String,
            default: null,
        },
        trainRunStationIndex: {
            type: Number,
            default: null,
        },
    },
    setup(props, { slots }) {
        const refs = toRefs(props);

        const arrived = computed(() => {
            switch (refs.id.value) {
                case TrainStationStatic.INCOMING:
                    return refs.trainBuildStatus.value === TrainBuildStatus.FINISHED &&
                        refs.trainRunStatus.value !== TrainRunStatus.FINISHED &&
                        refs.trainRunStationIndex.value === null;
                case TrainStationStatic.OUTGOING:
                    return refs.trainRunStatus.value === TrainRunStatus.FINISHED;
            }

            return false;
        });

        const departed = computed(() => {
            switch (refs.id.value) {
                case TrainStationStatic.INCOMING:
                    return refs.trainBuildStatus.value === TrainBuildStatus.FINISHED &&
                        (
                            refs.trainRunStatus.value === TrainRunStatus.RUNNING ||
                            refs.trainRunStatus.value === TrainRunStatus.FINISHED
                        );
            }

            return false;
        });

        const statusText = computed(() => {
            if (arrived.value) {
                return 'arrived';
            }

            if (departed.value) {
                return 'departed';
            }

            return 'none';
        });

        const classSuffix = computed(() => {
            switch (true) {
                case arrived.value:
                    return 'primary';
                case departed.value:
                    return 'success';
                default:
                    return 'info';
            }
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', {
                classSuffix: classSuffix.value,
                statusText: statusText.value,
            }, slots);
        }

        return () => h('span', {
            class: `text-${classSuffix.value}`,
        }, [statusText.value]);
    },
});
