/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainBuildStatus, TrainRunStatus, TrainStationStatic } from '@personalhealthtrain/central-common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import { SlotName, hasNormalizedSlot, normalizeSlot } from '@vue-layout/utils';

export default Vue.extend({
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
    computed: {
        arrived() {
            switch (this.id) {
                case TrainStationStatic.INCOMING:
                    return this.trainBuildStatus === TrainBuildStatus.FINISHED &&
                        this.trainRunStatus !== TrainRunStatus.FINISHED &&
                        this.trainRunStationIndex === null;
                case TrainStationStatic.OUTGOING:
                    return this.trainRunStatus === TrainRunStatus.FINISHED;
            }

            return false;
        },
        departed() {
            switch (this.id) {
                case TrainStationStatic.INCOMING:
                    return this.trainBuildStatus === TrainBuildStatus.FINISHED &&
                        (
                            this.trainRunStatus === TrainRunStatus.RUNNING ||
                            this.trainRunStatus === TrainRunStatus.FINISHED
                        );
            }

            return false;
        },
        statusText() {
            if (this.arrived) {
                return 'arrived';
            }

            if (this.departed) {
                return 'departed';
            }

            return 'none';
        },
        classSuffix() {
            switch (true) {
                case this.arrived:
                    return 'primary';
                case this.departed:
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
