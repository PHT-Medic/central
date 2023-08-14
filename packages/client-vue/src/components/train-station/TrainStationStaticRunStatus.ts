/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainBuildStatus, TrainRunStatus, TrainStationStatic } from '@personalhealthtrain/core';
import type { PropType } from 'vue';
import { computed, defineComponent, h } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../core';

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
        const arrived = computed(() => {
            switch (props.id) {
                case TrainStationStatic.INCOMING:
                    return props.trainBuildStatus === TrainBuildStatus.FINISHED &&
                        props.trainRunStatus !== TrainRunStatus.FINISHED &&
                        props.trainRunStationIndex === null;
                case TrainStationStatic.OUTGOING:
                    return props.trainRunStatus === TrainRunStatus.FINISHED;
            }

            return false;
        });

        const departed = computed(() => {
            switch (props.id) {
                case TrainStationStatic.INCOMING:
                    return props.trainBuildStatus === TrainBuildStatus.FINISHED &&
                        (
                            props.trainRunStatus === TrainRunStatus.RUNNING ||
                            props.trainRunStatus === TrainRunStatus.FINISHED
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
