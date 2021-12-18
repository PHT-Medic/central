<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
    addProposal, getAPIStations,
} from '@personalhealthtrain/ui-common';
import {
    alpha, integer, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

import MasterImagePicker from '../../../components/domains/master-image/MasterImagePicker';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';
import StationList from '../../../components/domains/station/StationList';
import ToggleManyButton from '../../../components/ToggleManyButton';

export default {
    components: { ToggleManyButton, StationList, MasterImagePicker },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
        ],
    },
    data() {
        return {
            formData: {
                title: '',
                requested_data: '',
                station_ids: [],
                master_image_id: '',
                risk: '',
                risk_comment: '',
            },

            busy: false,
            errorMessage: '',

            station: {
                items: [],
                busy: false,
            },

            risks: [
                { id: 'low', name: '(Low) Low risk', class: 'btn-success' },
                { id: 'mid', name: '(Mid) Mid risk', class: 'btn-warning' },
                { id: 'high', name: '(High) High risk', class: 'btn-danger' },
            ],
        };
    },
    validations: {
        formData: {
            title: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
            requested_data: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
            station_ids: {
                required,
                minLength: minLength(1),
                $each: {
                    required,
                    integer,
                },
            },
            master_image_id: {
                required,
            },
            risk: {
                required,
                alpha,
            },
            risk_comment: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
        },
    },
    methods: {
        handleMasterImagePicker(id) {
            this.formData.master_image_id = id || '';
        },
        async handleSubmit(e) {
            e.preventDefault();

            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                const proposal = await addProposal(this.formData);

                await this.$nuxt.$router.push(`/proposals/${proposal.id}`);
            } catch (e) {
                this.errorMessage = e.message;
            }

            this.busy = false;
        },
        async toggleFormData(key, id) {
            switch (key) {
                case 'station_ids': {
                    const index = this.formData.station_ids.indexOf(id);
                    if (index === -1) {
                        this.formData.station_ids.push(id);
                    } else {
                        this.formData.station_ids.splice(index, 1);
                    }
                    break;
                }
                default: {
                    if (this.formData[key] === id) {
                        this.formData[key] = null;
                    } else {
                        this.formData[key] = id;
                    }
                    break;
                }
            }
        },
    },
};
</script>
<template>
    <div>
        <div
            v-if="errorMessage !== ''"
            class="alert alert-danger alert-sm"
        >
            {{ errorMessage }}
        </div>
        <form>
            <div class="row">
                <div class="col-md-6">
                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.formData.title.$error }"
                    >
                        <label>Title</label>
                        <input
                            v-model="$v.formData.title.$model"
                            type="text"
                            class="form-control"
                            placeholder="..."
                        >

                        <div
                            v-if="!$v.formData.title.required"
                            class="form-group-hint group-required"
                        >
                            Provide a title for the train.
                        </div>
                        <div
                            v-if="!$v.formData.title.minLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be greater than <strong>{{ $v.formData.title.$params.minLength.min }}</strong> characters.
                        </div>
                        <div
                            v-if="!$v.formData.title.maxLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be less than <strong>{{ $v.formData.title.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <hr>

                    <div>
                        <master-image-picker @selected="handleMasterImagePicker" />

                        <div
                            v-if="!$v.formData.master_image_id.required"
                            class="form-group-hint group-required"
                        >
                            Select a master image.
                        </div>
                    </div>

                    <hr>

                    <div>
                        <span>Risk</span>
                        <div
                            class="row mt-1 mb-2"
                        >
                            <div
                                v-for="(item,key) in risks"
                                :key="key"
                                class="col"
                            >
                                <button
                                    class="btn btn-block"
                                    :style="{
                                        opacity: item.id === formData.risk ? 1 : 0.5
                                    }"
                                    :class="{
                                        [item.class]: true,
                                        'font-weight-bold': item.id === formData.risk
                                    }"
                                    type="button"
                                    @click.prevent="toggleFormData('risk', item.id)"
                                >
                                    {{ item.name }}
                                </button>
                            </div>
                        </div>

                        <div
                            v-if="!$v.formData.risk.required"
                            class="alert alert-sm alert-warning"
                        >
                            Specify the possible risk for a station in general.
                        </div>
                    </div>

                    <hr>

                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.formData.risk_comment.$error }"
                    >
                        <label>Risk statement</label>
                        <textarea
                            v-model="$v.formData.risk_comment.$model"
                            class="form-control"
                            placeholder="..."
                            rows="6"
                        />
                        <div
                            v-if="!$v.formData.risk_comment.required"
                            class="form-group-hint group-required"
                        >
                            Describe the risk in a few words.
                        </div>
                        <div
                            v-if="!$v.formData.risk_comment.minLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be greater than
                            <strong>{{ $v.formData.risk_comment.$params.minLength.min }}</strong> characters.
                        </div>
                        <div
                            v-if="!$v.formData.risk_comment.maxLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be less than
                            <strong>{{ $v.formData.risk_comment.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group">
                        <button
                            type="submit"
                            class="btn btn-outline-primary btn-sm"
                            :disabled="$v.$invalid || busy"
                            @click="handleSubmit"
                        >
                            Create
                        </button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div>
                        <station-list>
                            <template #header-title>
                                Stations
                            </template>
                            <template #item-actions="props">
                                <toggle-many-button
                                    :id="props.item.id"
                                    :ids="formData.station_ids"
                                    @toggle="toggleFormData('station_ids', props.item.id)"
                                />
                            </template>
                        </station-list>

                        <div
                            v-if="!$v.formData.station_ids.required"
                            class="alert alert-warning alert-sm"
                        >
                            Select one or more stations.
                        </div>
                        <div
                            v-if="!$v.formData.station_ids.minLength"
                            class="alert alert-warning alert-sm"
                        >
                            Select at least <strong>{{ $v.formData.station_ids.$params.minLength.min }}</strong> stations.
                        </div>
                    </div>

                    <hr>

                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.formData.requested_data.$error }"
                    >
                        <label>Data/Parameters</label>
                        <textarea
                            v-model="$v.formData.requested_data.$model"
                            class="form-control"
                            placeholder="..."
                            rows="6"
                        />

                        <div
                            v-if="!$v.formData.requested_data.required"
                            class="form-group-hint group-required"
                        >
                            Describe in a few words, what kind of data is required for the algorithm.
                        </div>
                        <div
                            v-if="!$v.formData.requested_data.minLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be greater than
                            <strong>{{ $v.formData.requested_data.$params.minLength.min }}</strong> characters.
                        </div>
                        <div
                            v-if="!$v.formData.requested_data.maxLength"
                            class="form-group-hint group-required"
                        >
                            The length of the comment must be less than
                            <strong>{{ $v.formData.requested_data.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>
