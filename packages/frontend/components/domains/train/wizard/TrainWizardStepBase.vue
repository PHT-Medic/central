<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    ProposalStationApprovalStatus,
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName,
} from '@personalhealthtrain/ui-common';
import { minLength, numeric, required } from 'vuelidate/lib/validators';
import ProposalStationList from '../../proposal-station/ProposalStationList';
import MasterImagePicker from '../../master-image/MasterImagePicker';

export default {
    components: {
        MasterImagePicker,
        ProposalStationList,
    },
    props: {
        train: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                master_image_id: '',
                station_ids: [],
            },

            proposalStationStatus: ProposalStationApprovalStatus,
            proposalStation: {
                items: [],
                busy: false,
            },
            trainStation: {
                items: [],
                busy: false,
            },

            master_image: {
                items: [],
                busy: false,
            },

            socketLockedId: null,
            socketLockedStationId: null,
        };
    },
    validations() {
        return {
            form: {
                master_image_id: {
                    required,
                    numeric,
                },
                station_ids: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                        numeric,
                    },
                },
            },
        };
    },
    computed: {
        selectedTrainStations() {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            return this.trainStation.items.sort((a, b) => (a.position > b.position ? 1 : -1));
        },
        direction() {
            return this.train.realm_id === this.$store.getters['auth/userRealmId'] ?
                'out' :
                'in';
        },
    },
    created() {
        Promise.resolve()
            .then(this.loadTrainStations);
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.train.realm_id);
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
        const socket = this.$socket.useRealmWorkspace(this.train.realm_id);
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
                context.data.train_id !== this.train.id ||
                context.data.station_id === this.socketLockedStationId
            ) return;

            this.handleTrainStationCreated(context.data);
        },
        handleSocketDeleted(context) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.train_id !== this.train.id ||
                context.data.id === this.socketLockedId
            ) return;

            this.handleTrainStationDeleted(context.data);
        },
        proposalStationFilter(item) {
            return this.trainStation.items.findIndex((trainStation) => trainStation.station_id === item.station_id) === -1;
        },

        handleMasterImageSelected(item) {
            this.$emit('setTrainMasterImage', item);
        },
        handleTrainStationCreated(item) {
            const index = this.trainStation.items.findIndex((trainStation) => trainStation.id === item.id);
            if (index === -1) {
                this.trainStation.items.push(item);

                this.$emit('updated', {
                    stations: this.trainStation.items.length,
                });
            }
        },
        handleTrainStationDeleted(item) {
            const index = this.trainStation.items.findIndex((trainStation) => trainStation.id === item.id);
            if (index !== -1) {
                this.trainStation.items.splice(index, 1);

                this.$emit('updated', {
                    stations: this.trainStation.items.length,
                });
            }
        },
        handleProposalStationDeleted(item) {
            const index = this.trainStation.items.findIndex((trainStation) => trainStation.station_id === item.station_id);
            if (index !== -1) {
                this.trainStation.items.splice(index, 1);
            }
        },

        async loadTrainStations() {
            if (this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                const response = await this.$api.trainStation.getMany({
                    filter: {
                        train_id: this.train.id,
                    },
                    sort: {
                        position: 'ASC',
                    },
                });

                this.trainStation.items = response.data;
            } catch (e) {
                // ...
            }

            this.trainStation.busy = false;
        },
        async addTrainStation(stationId) {
            if (this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                this.socketLockedStationId = stationId;

                const trainStation = await this.$api.trainStation.create({
                    train_id: this.train.id,
                    station_id: stationId,
                    position: this.trainStation.items.length,
                });

                this.socketLockedStationId = null;

                this.handleTrainStationCreated(trainStation);
            } catch (e) {
                // ...
            }

            this.trainStation.busy = false;
        },
        async dropTrainStation(item) {
            if (this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                this.socketLockedId = item.id;
                await this.$api.trainStation.delete(item.id);

                this.handleTrainStationDeleted(item);
                this.socketLockedId = null;
            } catch (e) {
                // ...
                console.log(e);
            }

            this.trainStation.busy = false;
        },
        async moveStationPosition(direction, trainStationId) {
            if (this.trainStation.busy) return;

            this.trainStation.busy = true;

            const index = this.trainStation.items.findIndex((trainStation) => trainStation.id === trainStationId);
            if (index === -1) {
                return;
            }

            try {
                switch (direction) {
                    // 4 -> 3
                    case 'up':
                        if (index === 0) {
                            return;
                        }

                        await this.$api.trainStation.update(this.trainStation.items[index].id, {
                            position: index - 1,
                        });

                        await this.$api.trainStation.update(this.trainStation.items[index - 1].id, {
                            position: index,
                        });

                        this.trainStation.items[index].position = index - 1;
                        this.trainStation.items[index - 1].position = index;

                        this.trainStation.items.splice(index - 1, 2, this.trainStation.items[index], this.trainStation.items[index - 1]);

                        break;
                    // 3 -> 4
                    case 'down':
                        await this.$api.trainStation.update(this.trainStation.items[index].id, {
                            position: index + 1,
                        });

                        await this.$api.trainStation.update(this.trainStation.items[index + 1].id, {
                            position: index,
                        });

                        this.trainStation.items[index].position = index + 1;
                        this.trainStation.items[index + 1].position = index;

                        this.trainStation.items.splice(index, 2, this.trainStation.items[index + 1], this.trainStation.items[index]);
                        break;
                    default:
                        return;
                }
            } catch (e) {
                console.log(e);
            }

            this.trainStation.busy = false;
        },
    },
};
</script>
<template>
    <div>
        <div class="mb-2">
            <h6>MasterImage</h6>
            <div class="mb-2">
                <master-image-picker
                    :master-image-id="train.master_image_id"
                    @selected="handleMasterImageSelected"
                />

                <div
                    v-if="!train.master_image_id"
                    class="form-group-hint group-required"
                >
                    Please select a master image.
                </div>
            </div>
        </div>

        <hr>

        <div>
            <h6>Stations</h6>
            <div class="row">
                <div class="col-12 col-xl-6">
                    <proposal-station-list
                        :proposal-id="train.proposal_id"
                        :realm-id="train.realm_id"
                        :filter="proposalStationFilter"
                        @deleted="handleProposalStationDeleted"
                    >
                        <template #header>
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template #actions="props">
                            <button
                                type="button"
                                class="btn btn-primary btn-xs"
                                :disabled="props.item.approval_status !== proposalStationStatus.APPROVED"
                                @click.prevent="addTrainStation(props.item.station_id)"
                            >
                                <i class="fa fa-plus" />
                            </button>
                        </template>
                    </proposal-station-list>
                </div>
                <div class="col-12 col-xl-6">
                    <span>Stations <span class="text-success">selected</span></span>

                    <div class="c-list">
                        <div
                            v-for="(item, key) in selectedTrainStations"
                            :key="item.id"
                            class="c-list-item mb-2"
                        >
                            <div class="c-list-content align-items-center">
                                <div class="c-list-icon">
                                    <i class="fa fa-hospital" />
                                </div>
                                <span class="mb-0">
                                    <template v-if="item.station">
                                        {{ item.station.name }}
                                    </template>
                                    <template v-else>
                                        Station #{{ item.station_id }}
                                    </template>
                                </span>
                                <div class="ml-auto">
                                    <button
                                        type="button"
                                        class="btn btn-danger btn-xs"
                                        @click.prevent="dropTrainStation(item)"
                                    >
                                        <i class="fa fa-minus" />
                                    </button>
                                    <button
                                        v-if="key !== 0"
                                        type="button"
                                        class="btn btn-primary btn-xs"
                                        @click.prevent="moveStationPosition('up', item.id)"
                                    >
                                        <i class="fa fa-arrow-up" />
                                    </button>
                                    <button
                                        v-if="key < trainStation.items.length -1"
                                        type="button"
                                        class="btn btn-primary btn-xs"
                                        @click.prevent="moveStationPosition('down', item.id)"
                                    >
                                        <i class="fa fa-arrow-down" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="trainStation.items.length === 0"
                        class="alert alert-sm alert-warning"
                    >
                        Please select one or more stations for your train.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
