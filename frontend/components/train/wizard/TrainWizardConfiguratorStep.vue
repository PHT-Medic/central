<script>
import {getMasterImages} from "@/domains/masterImage/api.ts";
import {getApiProposalStations} from "@/domains/proposal/station/api.ts";
import {minLength, numeric, required} from "vuelidate/lib/validators";
import {addTrainStation, dropTrainStation, editTrainStation} from "@/domains/train-station/api";
import {ProposalStationStatusOptions} from "@/domains/proposal/station";
import ProposalStationList from "@/components/proposal/ProposalStationList";

export default {
    components: {ProposalStationList},
    props: {
        train: {
            type: Object,
            default: undefined
        },
        trainStations: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            form: {
                masterImageId: '',
                query: '',
                stationIds: []
            },

            proposalStationStates: ProposalStationStatusOptions,
            proposalStation: {
                items: [],
                busy: false
            },
            trainStation: {
                items: [],
                busy: false
            },

            masterImage: {
                items: [],
                busy: false
            }
        }
    },
    validations() {
        return {
            form: {
                masterImageId: {
                    required,
                    numeric
                },
                stationIds: {
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
            return this.proposalStation.items.filter(item => this.trainStation.items.findIndex(trainStation => trainStation.stationId === item.stationId) === -1);
        }
    },
    created() {
        this.initTrain();

        this.loadMasterImages();
        this.loadProposalStations();
    },
    methods: {
        proposalStationFilter(item) {
            return this.trainStation.items.findIndex(trainStation => trainStation.stationId === item.stationId) === -1;
        },
        initTrain() {
            if(!!this.trainStations) {
                this.trainStation.items = this.trainStations;
            }

            if(!!this.train.masterImageId) {
                this.form.masterImageId = this.train.masterImageId;
            }

            if(!!this.train.query) {
                this.form.query = this.train.query;
            }
        },
        async loadMasterImages() {
            if(this.masterImage.busy) return;

            this.masterImage.busy = true;

            try {
                this.masterImage.items = await getMasterImages();
                if(this.form.masterImageId === '' && this.masterImage.items.length > 0) {
                    this.form.masterImageId = this.masterImage.items[0].id;
                    this.setTrainMasterImage();
                }
            } catch (e) {

            }

            this.masterImage.busy = false;
        },
        async loadProposalStations() {
            if(this.proposalStation.busy) return;

            if(typeof this.train.proposalId === 'undefined') {
                return;
            }

            const proposalId = this.train.proposalId ?? this.train.proposal.id;

            this.proposalStation.busy = true;

            try {
                const response = await getApiProposalStations({
                    filter: {
                        proposalId
                    }
                });

                this.proposalStation.items = response.data;
            } catch (e) {
                console.log(e);
            }

            this.proposalStation.busy = false;
        },

        setTrainMasterImage() {
            this.$emit('setTrainMasterImage', this.form.masterImageId);
        },
        setTrainStations() {
            this.$emit('setTrainStations', this.trainStation.items);
        },
        setQuery() {
            this.$emit('setTrainQuery', this.form.query);
        },

        async addTrainStation(stationId) {
            if(this.trainStation.busy) return;

            this.trainStation.busy = true;

            try {
                const trainStation = await addTrainStation({
                    trainId: this.train.id,
                    stationId: stationId,
                    position: this.trainStation.items.length
                });

                const index = this.proposalStation.items.findIndex(proposalStation => proposalStation.stationId === stationId);
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
                await dropTrainStation(trainStationId);

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

                        await editTrainStation(this.trainStation.items[index].id, {
                            position: index - 1
                        });

                        await editTrainStation(this.trainStation.items[index-1].id, {
                            position: index
                        })

                        this.trainStation.items[index].position = index - 1;
                        this.trainStation.items[index-1].position = index;

                        this.trainStation.items.splice(index - 1, 2, this.trainStation.items[index], this.trainStation.items[index - 1]);

                        break;
                    // 3 -> 4
                    case 'down':
                        await editTrainStation(this.trainStation.items[index].id, {
                            position: index + 1
                        });

                        await editTrainStation(this.trainStation.items[index+1].id, {
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
    <div class="row">
        <div class="col">
            <div class="form-group" :class="{ 'form-group-error': $v.form.masterImageId.$error }">
                <label>Master Image</label>
                <select v-model="$v.form.masterImageId.$model" class="form-control" @change="setTrainMasterImage" :disabled="masterImage.busy">
                    <option value="">--- Select an option ---</option>
                    <option v-for="(item,key) in masterImage.items" :key="key" :value="item.id">
                        {{ item.name }}
                    </option>
                </select>

                <div v-if="!$v.form.masterImageId.required" class="form-group-hint group-required">
                    Bitte wählen Sie ein Master Image aus, dass diesem Zug zugrunde liegt.
                </div>
            </div>

            <div class="row">
                <div class="col-4">
                    <proposal-station-list
                        :proposal-id="train.proposalId"
                        :filter="proposalStationFilter"
                    >
                        <template v-slot:header="props">
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template v-slot:actions="props">
                            <button
                                type="button"
                                class="btn btn-primary btn-xs"
                                :disabled="props.item.status !== proposalStationStates.ProposalStationStatusApproved"
                                @click.prevent="addTrainStation(props.item.stationId)"
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

                    <div v-if="trainStation.items.length === 0" class="alert alert-sm alert-info">
                        You haven't made a selection yet.
                    </div>
                </div>
            </div>

            <div v-if="trainStation.items.length === 0" class="alert alert-sm alert-warning">
                Please select one or more stations for your train.
            </div>
        </div>
        <div class="col">
            <div class="form-group">
                <label>Fhir Query</label>
                <textarea rows="8" class="form-control" @change.prevent="setQuery" v-model="$v.form.query.$model" placeholder="If you provide a query string, it must be a valid json formatted string..."></textarea>
            </div>
        </div>
    </div>
</template>
