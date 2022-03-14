<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { TrainType } from '@personalhealthtrain/central-common';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import { ProposalList } from '../proposal/ProposalList';
import { ProposalItem } from '../proposal/ProposalItem';

export default {
    components: { ProposalList, ProposalItem },
    props: {
        proposalId: {
            type: String,
            default: undefined,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
            formData: {
                type: TrainType.DISCOVERY,
                proposal_id: '',
                name: '',
            },
            types: [
                { id: TrainType.ANALYSE, name: 'Analysis' },
                { id: TrainType.DISCOVERY, name: 'Discovery' },
            ],
        };
    },
    computed: {
        proposalQuery() {
            return {
                filter: {
                    ...(this.realmId ? { realm_id: this.realmId } : {}),
                },
                include: {
                    user: true,
                },
            };
        },
    },
    created() {
        if (this.proposalId) {
            this.formData.proposal_id = this.proposalId;
        }
    },
    validations() {
        return {
            formData: {
                type: {
                    required,
                },
                proposal_id: {
                    required,
                },
                name: {
                    minLength: minLength(3),
                    maxLength: maxLength(128),
                },
            },
        };
    },
    methods: {
        async add() {
            if (this.busy) return;

            this.busy = true;

            try {
                const train = await this.$api.train.create({
                    ...this.formData,
                });
                this.$emit('created', train);
            } catch (e) {
                // ...
            }

            this.busy = false;
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
    <form @submit.prevent="add">
        <div class="row">
            <div class="col">
                <div
                    class="form-group"
                    :class="{ 'form-group-error': $v.formData.name.$error }"
                >
                    <label>Name <small class="text-muted">(optional)</small></label>
                    <input
                        v-model="$v.formData.name.$model"
                        type="text"
                        class="form-control"
                        placeholder="..."
                    >

                    <div
                        v-if="!$v.formData.name.minLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                    </div>
                    <div
                        v-if="!$v.formData.name.maxLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <hr>

                <div class="form-group">
                    <label>Type</label>
                    <select
                        v-model="$v.formData.type.$model"
                        class="form-control"
                    >
                        <option
                            v-for="(value,key) in types"
                            :key="key"
                            :value="value.id"
                        >
                            {{ value.name }}
                        </option>
                    </select>

                    <div
                        v-if="!$v.formData.type.required && !$v.formData.type.$model"
                        class="form-group-hint group-required"
                    >
                        Choose one of the available train types...
                    </div>
                </div>
                <div
                    v-if="$v.formData.type.$model"
                    class="alert alert-secondary alert-sm"
                >
                    <template v-if="$v.formData.type.$model === 'analyse'">
                        An analyse train should be created on base of the knowledge achieved during the discovery phase.
                    </template>
                    <template v-else>
                        ⚡ A discovery train can be used to get to know about the availability of data at the targeted stations.
                    </template>
                </div>

                <div>
                    <button
                        type="submit"
                        class="btn btn-xs btn-primary"
                        :disabled="$v.formData.$invalid || busy"
                        @click.prevent="add"
                    >
                        <i class="fa fa-plus" /> create
                    </button>
                </div>
            </div>
            <div
                v-if="!proposalId"
                class="col"
            >
                <proposal-list :query="proposalQuery">
                    <template #header>
                        Proposals
                    </template>
                    <template #item="props">
                        <proposal-item
                            :entity="props.item"
                            @updated="props.handleUpdated"
                            @deleted="props.handleDeleted"
                        >
                            <template #item-actions="itemActionProps">
                                <button
                                    :disabled="itemActionProps.busy"
                                    type="button"
                                    class="btn btn-xs"
                                    :class="{
                                        'btn-dark': formData.proposal_id !== itemActionProps.item.id,
                                        'btn-warning': formData.proposal_id === itemActionProps.item.id
                                    }"
                                    @click.prevent="toggleFormData('proposal_id', itemActionProps.item.id)"
                                >
                                    <i
                                        :class="{
                                            'fa fa-plus': formData.proposal_id !== itemActionProps.item.id,
                                            'fa fa-minus': formData.proposal_id === itemActionProps.item.id
                                        }"
                                    />
                                </button>
                            </template>
                        </proposal-item>
                    </template>
                </proposal-list>

                <div
                    v-if="!$v.formData.proposal_id.required && !$v.formData.proposal_id.$model"
                    class="alert alert-sm alert-warning"
                >
                    Choose a proposal as base of your train
                </div>
            </div>
        </div>
    </form>
</template>
