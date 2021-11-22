<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    addProposal,
    getAPIStations, PermissionID
} from "@personalhealthtrain/ui-common";
    import { required, minLength, maxLength, integer, alpha } from 'vuelidate/lib/validators';

    import ProposalFormTitle from "../../../components/form/proposal/ProposalFormTitle";
import MasterImagePicker from "../../../components/domains/master-image/MasterImagePicker";
import {LayoutKey, LayoutNavigationID} from "../../../config/layout/contants";

    export default {
        components: {MasterImagePicker, ProposalFormTitle},
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.PROPOSAL_ADD
            ]
        },
        data () {
            return {
                formData: {
                    title: '',
                    requested_data: '',
                    station_ids: [],
                    master_image_id: '',
                    risk: '',
                    risk_comment: ''
                },

                busy: false,
                errorMessage: '',

                station: {
                    items: [],
                    busy: false,
                },



                risks: [
                    { id: 'low', name: '(Low) Low risk' },
                    { id: 'mid', name: '(Mid) Mid risk' },
                    { id: 'high', name: '(High) High risk' }
                ]
            }
        },
        validations: {
            formData: {
                title: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
                requested_data: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                },
                station_ids: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                        integer
                    }
                },
                master_image_id: {
                    required
                },
                risk: {
                    required,
                    alpha
                },
                risk_comment: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                }
            }
        },
        created () {
            Promise.resolve()
                .then(this.loadStations)
        },
        methods: {
            handleMasterImagePicker(id) {
                this.formData.master_image_id = !!id ? id : '';
            },
            async loadStations() {
                if(this.station.busy) return;

                this.station.busy = true;

                try {
                    const {data} = await getAPIStations();

                    this.station.items = data;
                }  catch (e) {

                }

                this.station.busy = false;
            },
            async handleSubmit (e) {
                e.preventDefault();

                if(this.busy || this.$v.$invalid) {
                    return;
                }

                this.busy = true;

                try {
                    const proposal = await addProposal(this.formData);

                    await this.$nuxt.$router.push('/proposals/' + proposal.id);
                } catch (e) {
                    this.errorMessage = e.message;
                }

                this.busy = false;
            }
        }
    }
</script>
<template>
    <div>
        <div v-if="errorMessage !== ''" class="alert alert-danger alert-sm">{{ errorMessage }}</div>
        <form>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group" :class="{ 'form-group-error': $v.formData.title.$error }">
                        <label>Title</label>
                        <input v-model="$v.formData.title.$model" type="text" class="form-control" placeholder="...">

                        <div v-if="!$v.formData.title.required" class="form-group-hint group-required">
                            Please provide a title for the train.
                        </div>
                        <div v-if="!$v.formData.title.minLength" class="form-group-hint group-required">
                            The length of the comment must be greater than <strong>{{ $v.formData.title.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.title.maxLength" class="form-group-hint group-required">
                            The length of the comment must be less than <strong>{{ $v.formData.title.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <hr />

                    <div>
                        <master-image-picker @selected="handleMasterImagePicker" />

                        <div v-if="!$v.formData.master_image_id.required" class="form-group-hint group-required">
                            Please select a master image.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.risk.$error }">
                        <label>Risk</label>
                        <select v-model="$v.formData.risk.$model" class="form-control">
                            <option value="">
                                -- Please select --
                            </option>
                            <option v-for="(item,key) in risks" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                        <div v-if="!$v.formData.risk.required" class="form-group-hint group-required">
                            Please specify the risk for a station.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.risk_comment.$error }">
                        <label>Risk statement</label>
                        <textarea v-model="$v.formData.risk_comment.$model" class="form-control" placeholder="..." rows="6" />
                        <div v-if="!$v.formData.risk_comment.required" class="form-group-hint group-required">
                            Please make a risk statement.
                        </div>
                        <div v-if="!$v.formData.risk_comment.minLength" class="form-group-hint group-required">
                            The length of the comment must be greater than <strong>{{ $v.formData.risk_comment.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.risk_comment.maxLength" class="form-group-hint group-required">
                            The length of the comment must be less than  <strong>{{ $v.formData.risk_comment.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group">
                        <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                            Create
                        </button>
                    </div>

                </div>
                <div class="col-md-6">

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.station_ids.$anyError }">
                        <label>Stations</label>
                        <select v-model="$v.formData.station_ids.$model" class="form-control" style="height:100px;" multiple :disabled="station.busy">
                            <option v-for="(item,key) in station.items" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                        <div v-if="!$v.formData.station_ids.required" class="form-group-hint group-required">
                            Please select one or more stations.
                        </div>
                        <div v-if="!$v.formData.station_ids.minLength" class="form-group-hint">
                            Please select at least <strong>{{ $v.formData.station_ids.$params.minLength.min }}</strong> stations.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.requested_data.$error }">
                        <label>Data/Parameters</label>
                        <textarea v-model="$v.formData.requested_data.$model" class="form-control" placeholder="..." rows="6" />

                        <div v-if="!$v.formData.requested_data.required" class="form-group-hint group-required">
                            Please describe in few words, what kind of data you request for your algorithms.
                        </div>
                        <div v-if="!$v.formData.requested_data.minLength" class="form-group-hint group-required">
                            The length of the comment must be greater than <strong>{{ $v.formData.requested_data.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.requested_data.maxLength" class="form-group-hint group-required">
                            The length of the comment must be less than <strong>{{ $v.formData.requested_data.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                </div>
            </div>
        </form>
    </div>
</template>
