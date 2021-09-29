<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "@/components/alert/AlertMessage";
import {ProposalStationStatusOptions} from "@/domains/proposal/station";
import {editApiProposalStation} from "@/domains/proposal/station/api";

export default {
    components: {AlertMessage},
    props: {
        proposalStationProperty: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            formData: {
                comment: '',
                status: ''
            },

            statusOptions: [
                ProposalStationStatusOptions.ProposalStationStatusOpen,
                ProposalStationStatusOptions.ProposalStationStatusApproved,
                ProposalStationStatusOptions.ProposalStationStatusRejected
            ],

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            comment: {
                minLength: minLength(5),
                maxLength: maxLength(2048)
            },
            status: {
                required
            }
        }
    },
    created() {
        this.formData.status = this.proposalStationProperty.status ?? '';
        this.formData.comment = this.proposalStationProperty.comment ?? '';
    },
    methods: {
        initProposalStationOptions() {

        },
        async handleSubmit () {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                if(this.isEditing) {
                    const stationProposal = await editApiProposalStation(this.proposalStationProperty.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'The proposal was successfully updated.'
                    }

                    this.$emit('updated', stationProposal);
                }
            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true
                }
            }

            this.busy = false;
        }
    },
    computed: {
        isEditing() {
            return this.modeProperty !== 'add';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="alert alert-info alert-sm">
            You have to approve the proposal, so the proposal owner can target you as a station for the train route.
        </div>

        <div>
            <div class="form-group" :class="{ 'form-group-error': $v.formData.comment.$error }">
                <label>Comment</label>
                <textarea
                    rows="10"
                    v-model="$v.formData.comment.$model"
                    type="text" name="name"
                    class="form-control"
                    placeholder="Write a comment why you want to approve or either reject the proposal."
                />

                <div v-if="!$v.formData.comment.required && !$v.formData.comment.$model" class="form-group-hint group-required">
                    Please write a comment.
                </div>
                <div v-if="!$v.formData.comment.minLength" class="form-group-hint group-required">
                    The length of the comment must be greater than <strong>{{ $v.formData.comment.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.formData.comment.maxLength" class="form-group-hint group-required">
                    The length of the comment must be less than <strong>{{ $v.formData.comment.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.status.$error }">
                <label>Status</label>
                <select
                    v-model="$v.formData.status.$model"
                    class="form-control"
                >
                    <option value="">--- Please select ---</option>
                    <option v-for="(item,key) in statusOptions" :value="item" :key="key">{{ item }}</option>
                </select>

                <div v-if="!$v.formData.status.required && !$v.formData.status.$model" class="form-group-hint group-required">
                    Provide a status.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="handleSubmit">
                    {{ isEditing ? 'Update' : 'Create' }}
                </button>
            </div>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
