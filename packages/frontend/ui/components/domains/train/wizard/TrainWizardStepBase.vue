<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    ProposalStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { minLength, required } from 'vuelidate/lib/validators';
import { ProposalStationList } from '../../proposal-station/ProposalStationList';
import { MasterImagePicker } from '../../master-image/MasterImagePicker';
import { TrainStationList } from '../../train-station/TrainStationList';
import { TrainStationAssignAction } from '../../train-station/TrainStationAssignAction';

export default {
    components: {
        TrainStationAssignAction,
        TrainStationList,
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

            socketLockedId: null,
            socketLockedStationId: null,
        };
    },
    validations() {
        return {
            form: {
                station_ids: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                    },
                },
            },
        };
    },
    computed: {
        realmId() {
            return this.$store.getters['auth/userRealmId'];
        },
        direction() {
            return this.train.realm_id === this.$store.getters['auth/userRealmId'] ?
                'out' :
                'in';
        },
    },
    methods: {
        async handleMasterImageSelected(item) {
            try {
                const response = await this.$api.train.update(this.train.id, {
                    master_image_id: item ? item.id : null,
                });

                this.$emit('updated', response);
            } catch (e) {
                // ...
            }
        },
        handleTrainStationCreated(item) {
            this.$refs.trainStationList.handleCreated(item);

            if (item.train) {
                this.$emit('updated', item.train);
            }
        },
        handleTrainStationDeleted(item) {
            this.$refs.trainStationList.handleDeleted(item);

            if (item.train) {
                this.$emit('updated', item.train);
            }
        },

        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <div>
        <div class="mb-2">
            <h6><i class="fa fa-compact-disc" /> MasterImage</h6>
            <div class="mb-2">
                <master-image-picker
                    :entity-id="train.master_image_id"
                    @selected="handleMasterImageSelected"
                />
            </div>
        </div>

        <hr>

        <div>
            <h6><i class="fa fa-city" /> Stations</h6>

            <div class="row">
                <div class="col-12 col-xl-6">
                    <proposal-station-list
                        ref="proposalStationList"
                        :domain="'station'"
                        :realm-id="train.realm_id"
                        :direction="'out'"
                        :query="{filter: {proposal_id: train.proposal_id}}"
                    >
                        <template #header>
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template #item-actions="props">
                            <train-station-assign-action
                                :station-id="props.item.station_id"
                                :train-id="train.id"
                                :realm-id="train.realm_id"
                                @created="handleTrainStationCreated"
                                @deleted="handleTrainStationDeleted"
                                @failed="handleFailed"
                            />
                        </template>
                    </proposal-station-list>
                </div>
                <div class="col-12 col-xl-6">
                    <train-station-list
                        ref="trainStationList"
                        :domain="'station'"
                        :realm-id="train.realm_id"
                        :direction="'out'"
                        :query="{filter: {train_id: train.id}}"
                    >
                        <template #header>
                            <span>Stations <span class="text-success">selected</span></span>
                        </template>
                    </train-station-list>
                </div>
            </div>
        </div>
    </div>
</template>
