<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import { required, minLength, maxLength, integer, alpha } from 'vuelidate/lib/validators';

    import ProposalFormTitle from "../../../components/form/proposal/ProposalFormTitle";
    import {getStations} from "@/domains/station/api.ts";
    import {getMasterImages} from "@/domains/masterImage/api.ts";
    import {addProposal} from "@/domains/proposal/api.ts";

    export default {
        components: {ProposalFormTitle},
        meta: {
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add', 'proposal');
            }
        },
        data () {
            return {
                formData: {
                    title: '',
                    requestedData: '',
                    stationIds: [],
                    masterImageId: '',
                    risk: '',
                    riskComment: ''
                },

                busy: false,
                errorMessage: '',

                stations: [],
                stationsLoading: false,

                masterImages: [],
                masterImagesLoading: false,

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
                requestedData: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                },
                stationIds: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                        integer
                    }
                },
                masterImageId: {
                    required,
                    integer
                },
                risk: {
                    required,
                    alpha
                },
                riskComment: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                }
            }
        },
        created () {
            this.stationsLoading = true;
            getStations().then((response) => {
                this.stations = response.data;
                this.stationsLoading = false
            });

            this.masterImagesLoading = true;
            getMasterImages().then((data) => {
                this.masterImages = data.data;
                this.masterImagesLoading = false
            });
        },
        methods: {
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

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.masterImageId.$error }">
                        <label>Master Image</label>
                        <select v-model="$v.formData.masterImageId.$model" class="form-control" :disabled="masterImagesLoading">
                            <option value="">
                                -- Please select --
                            </option>
                            <option v-for="(item,key) in masterImages" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>

                        <div v-if="!$v.formData.masterImageId.required" class="form-group-hint group-required">
                            Please choose a master image. It will be the base for your entry point when you start a train.
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

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.riskComment.$error }">
                        <label>Risk statement</label>
                        <textarea v-model="$v.formData.riskComment.$model" class="form-control" placeholder="..." rows="6" />
                        <div v-if="!$v.formData.riskComment.required" class="form-group-hint group-required">
                            Please make a risk statement.
                        </div>
                        <div v-if="!$v.formData.riskComment.minLength" class="form-group-hint group-required">
                            The length of the comment must be greater than <strong>{{ $v.formData.riskComment.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.riskComment.maxLength" class="form-group-hint group-required">
                            The length of the comment must be less than  <strong>{{ $v.formData.riskComment.$params.maxLength.max }}</strong> characters.
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

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.stationIds.$anyError }">
                        <label>Stations</label>
                        <select v-model="$v.formData.stationIds.$model" class="form-control" style="height:100px;" multiple :disabled="stationsLoading">
                            <option v-for="(item,key) in stations" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                        <div v-if="!$v.formData.stationIds.required" class="form-group-hint group-required">
                            Please select one or more stations.
                        </div>
                        <div v-if="!$v.formData.stationIds.minLength" class="form-group-hint">
                            Please select at least <strong>{{ $v.formData.stationIds.$params.minLength.min }}</strong> stations.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.requestedData.$error }">
                        <label>Data/Parameters</label>
                        <textarea v-model="$v.formData.requestedData.$model" class="form-control" placeholder="..." rows="6" />

                        <div v-if="!$v.formData.requestedData.required" class="form-group-hint group-required">
                            Please describe in few words, what kind of data you request for your algorithms.
                        </div>
                        <div v-if="!$v.formData.requestedData.minLength" class="form-group-hint group-required">
                            The length of the comment must be greater than <strong>{{ $v.formData.requestedData.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.requestedData.maxLength" class="form-group-hint group-required">
                            The length of the comment must be less than <strong>{{ $v.formData.requestedData.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                </div>
            </div>
        </form>
    </div>
</template>
