<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>
import {
    alpha, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

import { ProposalRisk } from '@personalhealthtrain/central-common';
import MasterImagePicker from '../master-image/MasterImagePicker';
import StationList from '../station/StationList';
import ToggleManyButton from '../../ToggleManyButton';
import ProposalStationList from '../proposal-station/ProposalStationList';

export default {
    components: {
        ProposalStationList,
        ToggleManyButton,
        StationList,
        MasterImagePicker,
    },
    props: {
        entityProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            formData: {
                title: '',
                requested_data: '',
                master_image_id: '',
                risk: '',
                risk_comment: '',
            },

            busy: false,

            station: {
                selectedIds: [],
                items: [],
                busy: false,
            },

            risks: [
                { id: ProposalRisk.LOW, name: '(Low) Low risk', class: 'btn-success' },
                { id: ProposalRisk.MID, name: '(Mid) Mid risk', class: 'btn-warning' },
                { id: ProposalRisk.HIGH, name: '(High) High risk', class: 'btn-danger' },
            ],
        };
    },
    computed: {
        isEditing() {
            return this.entityProperty && Object.prototype.hasOwnProperty.call(this.entityProperty, 'id');
        },
        masterImageId() {
            return this.isEditing ? this.entityProperty.master_image_id : undefined;
        },
        updatedAt() {
            return this.isEditing ? this.entityProperty.updated_at : undefined;
        },
    },
    watch: {
        updatedAt(val, oldVal) {
            if (val && val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        this.initFromProperties();
    },
    validations() {
        const formData = {
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
        };

        return {
            formData,
            ...(this.isEditing ?
                {} :
                {
                    station: {
                        selectedIds: {
                            required,
                            minLength: minLength(1),
                            $each: {
                                required,
                            },
                        },
                    },
                }
            ),
        };
    },
    methods: {
        initFromProperties() {
            if (typeof this.entityProperty === 'undefined') return;

            const keys = Object.keys(this.formData);
            for (let i = 0; i < keys.length; i++) {
                if (Object.prototype.hasOwnProperty.call(this.entityProperty, keys[i])) {
                    this.formData[keys[i]] = this.entityProperty[keys[i]];
                }
            }
        },
        handleMasterImagePicker(item) {
            if (item) {
                this.formData.master_image_id = item.id;
            } else {
                this.formData.master_image_id = '';
            }
        },
        async handleSubmit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$api.proposal.update(this.entityProperty.id, this.formData);

                    this.$bvToast.toast('The proposal was successfully updated.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.proposal.create(this.formData);

                    for (let i = 0; i < this.station.selectedIds.length; i++) {
                        await this.$api.proposalStation.create({
                            proposal_id: response.id,
                            station_id: this.station.selectedIds[i],
                        });
                    }

                    this.$bvToast.toast('The realm was successfully created.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('created', response);
                }
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    variant: 'danger',
                    toaster: 'b-toaster-top-center',
                });
            }

            this.busy = false;
        },
        async toggleStationIds(id) {
            const index = this.station.selectedIds.indexOf(id);
            if (index === -1) {
                this.station.selectedIds.push(id);
            } else {
                this.station.selectedIds.splice(index, 1);
            }
        },
        async toggleFormData(key, id) {
            if (this.formData[key] === id) {
                this.formData[key] = null;
            } else {
                this.formData[key] = id;
            }
        },
    },
};
</script>
<template>
    <div>
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
                        <master-image-picker
                            :master-image-id="formData.master_image_id"
                            @selected="handleMasterImagePicker"
                        />

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
                            @click.prevent="handleSubmit"
                        >
                            {{ isEditing ? 'Update' : 'Create' }}
                        </button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div>
                        <template v-if="isEditing">
                            <proposal-station-list
                                ref="proposalStationList"
                                :realm-id="entityProperty.realm_id"
                                :proposal-id="entityProperty.id"
                            />
                        </template>
                        <template v-else>
                            <station-list>
                                <template #header-title>
                                    Stations
                                </template>
                                <template #item-actions="props">
                                    <toggle-many-button
                                        :id="props.item.id"
                                        :ids="station.selectedIds"
                                        @toggle="toggleStationIds(props.item.id)"
                                    />
                                </template>
                            </station-list>

                            <div
                                v-if="!$v.station.selectedIds.required"
                                class="alert alert-warning alert-sm"
                            >
                                Select one or more stations.
                            </div>
                            <div
                                v-if="!$v.station.selectedIds.minLength"
                                class="alert alert-warning alert-sm"
                            >
                                Select at least <strong>{{ $v.station.selectedIds.$params.minLength.min }}</strong> stations.
                            </div>
                        </template>
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
