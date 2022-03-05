<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    TrainBuildStatus,
    TrainRunStatus,
    TrainStationRunStatus,
    TrainStationStatic,
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName,
} from '@personalhealthtrain/central-common';
import TrainStationRunStatusText from './TrainStationRunStatus';
import TrainStationStaticRunStatusText from './TrainStationStaticRunStatus';

export default {
    components: { TrainStationStaticRunStatusText, TrainStationRunStatusText },
    props: {
        entity: Object,
        withHeader: {
            type: Boolean,
            default: false,
        },
        elementType: {
            type: String,
            default: 'steps',
        },
    },
    data() {
        return {
            meta: {
                limit: 20,
                offset: 0,
                total: 0,
            },
            items: [],
            busy: false,

            trainRunStatus: TrainRunStatus,
            trainStationStatic: TrainStationStatic,
            trainStationRunStatus: TrainStationRunStatus,
        };
    },
    computed: {
        progressPercentage() {
            if (this.entity.build_status !== TrainBuildStatus.FINISHED) {
                return 0;
            }

            const total = this.meta.total + 2; // + 2 because incoming + outgoing

            // no index -> outgoing or incoming
            if (!this.entity.run_station_index) {
                // outgoing, because train terminated
                if (this.entity.run_status === TrainRunStatus.FINISHED) {
                    return 100;
                }

                return 100 * (1 / total);
            }

            return 100 * ((this.entity.run_station_index + 1) / (total - 2));
        },
        direction() {
            return this.entity.realm_id === this.$store.getters['auth/userRealmId'] ?
                'out' :
                'in';
        },
    },
    created() {
        this.load().then((r) => r);
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.entity.realm_id);
        switch (this.direction) {
            case 'in':
                socket.emit('trainStationsInSubscribe');
                break;
            case 'out':
                socket.emit('trainStationsOutSubscribe');
                break;
        }
        socket.on('trainStationCreated', this.handleSocketCreated);
        socket.on('trainStationDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.entity.realm_id);
        switch (this.direction) {
            case 'in':
                socket.emit('trainStationsInUnsubscribe');
                break;
            case 'out':
                socket.emit('trainStationsOutUnsubscribe');
                break;
        }
        socket.off('trainStationCreated', this.handleSocketCreated);
        socket.off('trainStationDeleted', this.handleSocketDeleted);
    },
    methods: {
        isSameSocketRoom(room) {
            switch (this.direction) {
                case 'in':
                    return room === buildSocketTrainStationInRoomName();
                case 'out':
                    return room === buildSocketTrainStationOutRoomName();
            }

            return false;
        },
        handleSocketCreated(context) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.train_id !== this.entity.id
            ) return;

            this.handleTrainStationCreated(context.data);
        },
        handleSocketDeleted(context) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.train_id !== this.entity.id
            ) return;

            this.handleTrainStationDeleted(context.data);
        },

        handleTrainStationCreated(item) {
            const index = this.items.findIndex((trainStation) => trainStation.id === item.id);
            if (index === -1) {
                this.items.push(item);
                this.meta.total++;
            }
        },
        handleTrainStationDeleted(item) {
            const index = this.items.findIndex((trainStation) => trainStation.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },

        async load() {
            if (this.busy) return;

            this.busy = false;

            try {
                const response = await this.$api.trainStation.getMany({
                    filter: {
                        train_id: this.entity.id,
                    },
                });

                this.meta = response.meta;
                this.items = response.data;
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div>
        <template v-if="elementType === 'steps'">
            <div class="d-flex flex-row justify-content-around position-relative">
                <div class="icon-circle progress-step bg-dark text-light">
                    <span class="icon">Incoming Station</span>
                </div>
                <template v-for="(item,key) in items">
                    <div
                        :key="item.id"
                        class="icon-circle progress-step text-light"
                        :class="{
                            'bg-dark': !item.run_status,
                            'bg-success': item.run_status === trainStationRunStatus.DEPARTED,
                            'bg-primary': item.run_status === trainStationRunStatus.ARRIVED
                        }"
                    >
                        <span class="icon">Station {{ key + 1 }}</span>
                    </div>
                </template>
                <div class="icon-circle progress-step bg-dark text-light">
                    <span class="icon">Outgoing Station</span>
                </div>
            </div>
            <div class="d-flex flex-row justify-content-around position-relative mt-1">
                <div class="progress-step d-flex flex-column text-center">
                    <div class="">
                        <strong>Status</strong>
                    </div>
                    <div>
                        <train-station-static-run-status-text
                            :id="trainStationStatic.INCOMING"
                            :train-build-status="entity.build_status"
                            :train-run-status="entity.run_status"
                            :train-run-station-index="entity.run_station_index"
                        />
                    </div>
                </div>
                <template v-for="(item) in items">
                    <div
                        :key="item.id"
                        class="progress-step d-flex flex-column text-center"
                    >
                        <div class="">
                            <strong>Status</strong>
                        </div>
                        <div>
                            <train-station-run-status-text :status="item.run_status" />
                        </div>
                    </div>
                </template>
                <div class="progress-step d-flex flex-column text-center">
                    <div class="">
                        <strong>Status</strong>
                    </div>
                    <div>
                        <train-station-static-run-status-text
                            :id="trainStationStatic.OUTGOING"
                            :train-build-status="entity.build_status"
                            :train-run-status="entity.run_status"
                            :train-run-station-index="entity.run_station_index"
                        />
                    </div>
                </div>
            </div>
            <div class="alert alert-warning alert-sm mt-2 mb-0">
                The displayed station order, doesn't correspond to the actual route of the train.
            </div>
        </template>
        <template v-else>
            <div class="progress bg-white">
                <div
                    class="progress-bar"
                    :class="{
                        'bg-dark': entity.run_status !== trainRunStatus.FINISHED,
                        'bg-success': entity.run_status === trainRunStatus.FINISHED
                    }"
                    :style="{width: progressPercentage + '%'}"
                    :aria-valuenow="progressPercentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </template>
    </div>
</template>
