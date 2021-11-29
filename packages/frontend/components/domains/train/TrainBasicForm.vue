<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { TrainType, addAPITrain, getProposals } from '@personalhealthtrain/ui-common';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';

export default {
    props: {
        proposalId: {
            type: Number,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
            form: {
                type: 'discovery',
                proposal_id: '',
                name: '',
            },
            proposal: {
                items: [],
                busy: false,
            },
            types: [
                { id: TrainType.ANALYSE, name: 'Analyse' },
                { id: TrainType.DISCOVERY, name: 'Discovery' },
            ],
        };
    },
    validations() {
        return {
            form: {
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
    computed: {
        isDiscoveryTrain() {
            return this.form.type === 'discovery';
        },
        isAnalyseTrain() {
            return this.form.type === 'analyse';
        },
        fixedProposal() {
            return typeof this.proposalId !== 'undefined';
        },
    },
    created() {
        this.loadProposals().then(() => {
            if (typeof this.proposalId !== 'undefined') {
                const index = this.proposal.items.findIndex((proposal) => proposal.id === this.proposalId);
                if (index !== -1) {
                    this.form.proposal_id = this.proposalId;
                }
            }
        });
    },
    methods: {
        async loadProposals() {
            this.proposal.busy = true;

            try {
                // pagination handle multiple pages
                const { data } = await getProposals();
                this.proposal.items = data;
            } catch (e) {
                // ...
            }

            this.proposal.busy = false;
        },
        async add() {
            if (this.busy) return;

            this.busy = true;

            try {
                const train = await addAPITrain({
                    ...this.form,
                });
                this.$emit('created', train);
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <form @submit.prevent="add">
        <div
            class="form-group"
            :class="{ 'form-group-error': $v.form.name.$error }"
        >
            <label>Name <small class="text-muted">(optional)</small></label>
            <input
                v-model="$v.form.name.$model"
                type="text"
                class="form-control"
                placeholder="..."
            >

            <div
                v-if="!$v.form.name.minLength"
                class="form-group-hint group-required"
            >
                The length of the name must be greater than <strong>{{ $v.form.name.$params.minLength.min }}</strong> characters.
            </div>
            <div
                v-if="!$v.form.name.maxLength"
                class="form-group-hint group-required"
            >
                The length of the name must be less than <strong>{{ $v.form.name.$params.maxLength.max }}</strong> characters.
            </div>
        </div>

        <hr>

        <div class="form-group">
            <label>Type</label>
            <select
                v-model="$v.form.type.$model"
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
                v-if="!$v.form.type.required && !$v.form.type.$model"
                class="form-group-hint group-required"
            >
                Choose one of the available train types...
            </div>
        </div>
        <div
            v-if="$v.form.type.$model"
            class="alert alert-secondary alert-sm"
        >
            <template v-if="$v.form.type.$model === 'analyse'">
                An analyse train should be created on base of the knowledge achieved during the discovery phase.
            </template>
            <template v-else>
                ⚡ A discovery train can be used to get to know about the availability of data at the targeted stations.
            </template>
        </div>

        <hr>

        <div
            v-if="!fixedProposal"
            class="form-group"
        >
            <label>Proposal</label>
            <select
                v-model="$v.form.proposal_id.$model"
                class="form-control"
                :disabled="proposal.busy"
            >
                <option value="">
                    --- Select ---
                </option>
                <option
                    v-for="(value,key) in proposal.items"
                    :key="key"
                    :value="value.id"
                >
                    {{ value.title }}
                </option>
            </select>

            <div
                v-if="!$v.form.proposal_id.required && !$v.form.proposal_id.$model"
                class="form-group-hint group-required"
            >
                Choose a proposal as base of your train
            </div>
        </div>

        <div>
            <button
                type="submit"
                class="btn btn-xs btn-primary"
                :disabled="$v.form.$invalid || busy"
                @click.prevent="add"
            >
                <i class="fa fa-plus" /> create
            </button>
        </div>
    </form>
</template>
