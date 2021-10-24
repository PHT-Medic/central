<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    addAPITrainStation, dropAPITrainStation,
    editAPITrainStation,
    getAPIMasterImages,
    getApiProposalStations, getAPITrainStations, ProposalStationApprovalStatus
} from "@personalhealthtrain/ui-common";
import {minLength, numeric, required} from "vuelidate/lib/validators";
import ProposalStationList from "../../proposal-station/ProposalStationList";
import MasterImagePicker from "../../master-image/MasterImagePicker";

export default {
    components: {MasterImagePicker, ProposalStationList},
    props: {
        train: {
            type: Object,
            default: undefined
        },
        train_stations: Array
    },
    data() {
        return {
            form: {
                master_image_id: '',
                query: '',
                station_ids: []
            },

            proposalStationStatus: ProposalStationApprovalStatus,
            proposalStation: {
                items: [],
                busy: false
            },
            trainStation: {
                items: [],
                busy: false
            },

            master_image: {
                items: [],
                busy: false
            }
        }
    },
    validations() {
        return {
            form: {
                master_image_id: {
                    required,
                    numeric
                },
                station_ids: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                        numeric
                    }
                },
                query: {

                }
            }
        }
    },
    computed: {
        selectedTrainStations() {
            return this.trainStation.items.sort((a,b) => a.position > b.position ? 1 : -1);
        },
        availableProposalStations() {
            return this.proposalStation.items.filter(item => this.trainStation.items.findIndex(trainStation => trainStation.station_id === item.station_id) === -1);
        }
    },
    created() {
        this.initTrain();

        this.loadProposalStations();
    },
    methods: {
        proposalStationFilter(item) {
            return this.trainStation.items.findIndex(trainStation => trainStation.station_id === item.station_id) === -1;
        },
        initTrain() {
            if(!!this.train_stations) {
                this.trainStation.items = this.train_stations;
            } else {
                this.loadTrainStations();
            }

            if(!!this.train.master_image_id) {
                this.form.master_image_id = this.train.master_image_id;
            }

            if(!!this.train.query) {
                this.form.query = this.train.query;
            }
        },

        handleMasterImageSelected(id) {
            this.form.master_image_id = !!id ? id : '';
            this.setTrainMasterImage();
        },

        setTrainMasterImage() {
            this.$emit('setTrainMasterImage', this.form.master_image_id);
        },
        setTrainStations() {
            this.$emit('setTrainStations', this.trainStation.items);
        },
        setQuery() {
            this.$emit('setTrainQuery', this.form.query);
        },

        async loadProposalStations() {
            if(this.proposalStation.busy) return;

            if(typeof this.train.proposal_id === 'undefined') {
                return;
            }

            const proposal_id = this.train.proposal_id ?? this.train.proposal.id;

            this.proposalStation.busy = true;

            try {
                const response = await getApiProposalStations({
                    filter: {
                        proposal_id: proposal_id
                    }
                });

                this.proposalStation.items = response.data;
            } catch (e) {
                console.log(e);
            }

            this.proposalStation.busy = false;
        },
        async loadTrainStations() {
            if(this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                const response = await getAPITrainStations({
                    filter: {
                        train_id: this.train.id
                    }
                });

                this.trainStation.items = response.data;
                this.setTrainStations();

            } catch (e) {
                console.log(e);
            }

            this.trainStation.busy = false;
        },
        async addTrainStation(station_id) {
            if(this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                const trainStation = await addAPITrainStation({
                    train_id: this.train.id,
                    station_id: station_id,
                    position: this.trainStation.items.length
                });

                const index = this.proposalStation.items.findIndex(proposalStation => proposalStation.station_id === station_id);
                if(index !== -1) {
                    trainStation.station = this.proposalStation.items[index].station;
                    this.trainStation.items.push(trainStation);
                    this.setTrainStations();
                }
            } catch (e) {

            }

            this.trainStation.busy = false;

        },
        async dropTrainStation(trainStationId) {
            if(this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                await dropAPITrainStation(trainStationId);

                const index = this.trainStation.items.findIndex(trainStation => trainStation.id === trainStationId);
                if(index !== -1) {
                    this.trainStation.items.splice(index, 1);
                }
                this.setTrainStations();
            } catch (e) {
                console.log(e);
            }

            this.trainStation.busy = false;
        },
        async moveStationPosition(direction, trainStationId) {
            if(this.trainStation.busy) return;

            this.trainStation.busy = true;

            const index = this.trainStation.items.findIndex(trainStation => trainStation.id === trainStationId);
            if(index === -1) {
                return;
            }

            try {
                switch (direction) {
                    // 4 -> 3
                    case 'up':
                        if (index === 0) {
                            return;
                        }

                        await editAPITrainStation(this.trainStation.items[index].id, {
                            position: index - 1
                        });

                        await editAPITrainStation(this.trainStation.items[index-1].id, {
                            position: index
                        })

                        this.trainStation.items[index].position = index - 1;
                        this.trainStation.items[index-1].position = index;

                        this.trainStation.items.splice(index - 1, 2, this.trainStation.items[index], this.trainStation.items[index - 1]);

                        break;
                    // 3 -> 4
                    case 'down':
                        await editAPITrainStation(this.trainStation.items[index].id, {
                            position: index + 1
                        });

                        await editAPITrainStation(this.trainStation.items[index+1].id, {
                            position: index
                        })

                        this.trainStation.items[index].position = index + 1;
                        this.trainStation.items[index+1].position = index;

                        this.trainStation.items.splice(index, 2, this.trainStation.items[index + 1], this.trainStation.items[index]);
                        break;
                    default:
                        return;
                }

                this.setTrainStations();
            } catch (e) {
                console.log(e);
            }

            this.trainStation.busy = false;
        }
    }
}
</script>
<template>
    <div>
        <div class="mb-2">
            <h6>MasterImage</h6>
            <div class="mb-2">
                <master-image-picker @selected="handleMasterImageSelected" />

                <div v-if="!$v.form.master_image_id.required" class="form-group-hint group-required">
                    Please select a master image.
                </div>
            </div>
        </div>

        <hr />

        <div>
            <h6>Stations</h6>
            <div class="row">
                <div class="col-4">
                    <proposal-station-list
                        :proposal-id="train.proposal_id"
                        :filter="proposalStationFilter"
                    >
                        <template v-slot:header="props">
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template v-slot:actions="props">
                            <button
                                type="button"
                                class="btn btn-primary btn-xs"
                                :disabled="props.item.approval_status !== proposalStationStatus.APPROVED"
                                @click.prevent="addTrainStation(props.item.station_id)"
                            >
                                <i class="fa fa-plus"></i>
                            </button>
                        </template>
                    </proposal-station-list>
                </div>
                <div class="col-8">
                    <span>Stations <span class="text-success">selected</span></span>

                    <div class="c-list">
                        <div class="c-list-item mb-2"  v-for="(item,key) in selectedTrainStations" :key="key">
                            <div class="c-list-content align-items-center">
                                <div class="c-list-icon">
                                    <i class="fa fa-hospital"></i>
                                </div>
                                <span class="mb-0">{{item.station.name}}</span>
                                <div class="ml-auto">
                                    <button type="button" class="btn btn-danger btn-xs" @click.prevent="dropTrainStation(item.id)">
                                        <i class="fa fa-minus"></i>
                                    </button>
                                    <button v-if="key !== 0" type="button" class="btn btn-primary btn-xs" @click.prevent="moveStationPosition('up', item.id)">
                                        <i class="fa fa-arrow-up"></i>
                                    </button>
                                    <button v-if="key < trainStation.items.length -1" type="button" class="btn btn-primary btn-xs" @click.prevent="moveStationPosition('down', item.id)">
                                        <i class="fa fa-arrow-down"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="trainStation.items.length === 0" class="alert alert-sm alert-warning">
                        Please select one or more stations for your train.
                    </div>
                </div>
            </div>

            <!--
            <div class="form-group">
                <label>Fhir Query</label>
                <textarea rows="8" class="form-control" @change.prevent="setQuery" v-model="$v.form.query.$model" placeholder="If you provide a query string, it must be a valid json formatted string..."></textarea>
            </div>
            -->
        </div>
    </div>
</template>
