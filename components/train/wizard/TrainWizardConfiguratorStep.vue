<script>
import {getMasterImages} from "@/domains/masterImage/api.ts";
import {getApiProposalStations} from "@/domains/proposal/station/api.ts";
import {minLength, numeric, required} from "vuelidate/lib/validators";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            form: {
                masterImageId: '',
                stationIds: []
            },
            proposalStation: {
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
                }
            }
        }
    },
    computed: {
        trainExists() {
            return this.train.hasOwnProperty('id');
        },
    },
    created() {
        this.initTrain();

        this.loadMasterImages();
        this.loadProposalStations();
    },
    methods: {
        initTrain() {
            if(typeof this.train.stations !== 'undefined' && this.train.stations) {
                this.form.stationIds = this.train.stations.map(station => station.id);
            }

            if(typeof this.train.masterImageId !== 'undefined' && this.train.masterImageId) {
                this.form.masterImageId = this.train.masterImageId;
            }
        },
        async loadMasterImages() {
            if(this.masterImage.busy) return;

            this.masterImage.busy = true;

            try {
                this.masterImage.items = await getMasterImages();
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
                this.proposalStation.items = await getApiProposalStations(proposalId, 'self')
            } catch (e) {
                console.log(e);
            }

            this.proposalStation.busy = false;
        },

        setTrainMasterImage() {
            this.$emit('setTrainMasterImage', this.form.masterImageId);
        },
        setTrainStations() {
            this.$emit('setTrainStations', this.form.stationIds);
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

            <div class="form-group" :class="{ 'form-group-error': $v.form.stationIds.$anyError }">
                <label>Krankenhäuser</label>
                <select v-model="$v.form.stationIds.$model" class="form-control" @change="setTrainStations" multiple :disabled="proposalStation.busy">
                    <option v-for="(item,key) in proposalStation.items" :key="key" :value="item.station.id">
                        {{ item.station.name }}
                    </option>
                </select>
                <div v-if="!$v.form.stationIds.required" class="form-group-hint group-required">
                    Bitte wählen Sie eines oder mehere Krankenhäuser aus ihrem Antrag aus.
                </div>
                <div v-if="!$v.form.stationIds.minLength" class="form-group-hint">
                    Es muss mindestens <strong>{{ $v.form.stationIds.$params.minLength.min }}</strong> Krankenhaus/er ausgewählt werden.
                </div>
            </div>
        </div>
        <div class="col">
            <div class="form-group">
                <label>Fhir Query</label>
                <textarea rows="8" class="form-control" placeholder="If you provide a query string, it must be a valid json formatted string..."></textarea>
            </div>
        </div>

    </div>
</template>
