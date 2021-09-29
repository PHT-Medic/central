<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {addTrain} from "@/domains/train/api.ts";
import {getProposals} from "@/domains/proposal/api.ts";
import {required} from 'vuelidate/lib/validators';

export default {
    props: {
        proposalId: {
            type: Number,
            default: undefined
        }
    },
    data() {
        return {
            busy: false,
            form: {
                type: 'discovery',
                proposalId: ''
            },
            proposal: {
                items: [],
                busy: false
            },
            types: [
                {id: 'analyse', name: 'Analyse'},
                {id: 'discovery', name: 'Discovery'}
            ]
        }
    },
    validations() {
        return {
            form: {
                type: {
                    required,
                },
                proposalId: {
                    required
                }
            }
        }
    },
    created() {
        this.loadProposals().then(() => {
            if(typeof this.proposalId !== 'undefined') {
                const index = this.proposal.items.findIndex(proposal => proposal.id === this.proposalId);
                if (index !== -1) {
                    this.form.proposalId = this.proposalId;
                }
            }
        })
    },
    methods: {
        async loadProposals() {
            this.proposal.busy = true;

            try {
                // pagination handle multiple pages
                const { data } = await getProposals();
                this.proposal.items = data;
            } catch (e) {

            }

            this.proposal.busy = false;
        },
        async add() {
            if(this.busy) return;

            this.busy = true;

            try {
                const train = await addTrain(this.form);
                this.$emit('created', train);
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },
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
        }
    }
}
</script>
<template>
    <form @submit.prevent="add">
        <div class="form-group">
            <label>Type</label>
            <select class="form-control" v-model="$v.form.type.$model">
                <option v-for="(value,key) in types" :key="key" :value="value.id">
                    {{value.name}}
                </option>
            </select>

            <div v-if="!$v.form.type.required && !$v.form.type.$model" class="form-group-hint group-required">
                Choose one of the available train types...
            </div>
        </div>
        <div v-if="$v.form.type.$model" class="alert alert-info alert-sm">
            <template v-if="$v.form.type.$model === 'analyse'">
                Create a analyse train on base of the knowledge achieved during the discovery phase.
            </template>
            <template v-else>
                Create a discovery train, to get to know about the availability of data in the specified stations, depending on the parameters you have chosen in the proposal.
            </template>
        </div>

        <hr />

        <div v-if="!fixedProposal" class="form-group">
            <label>Proposal</label>
            <select class="form-control" v-model="$v.form.proposalId.$model" :disabled="proposal.busy">
                <option value="">--- Select an option ---</option>
                <option v-for="(value,key) in proposal.items" :key="key" :value="value.id">
                    {{value.title}}
                </option>
            </select>

            <div v-if="!$v.form.proposalId.required && !$v.form.proposalId.$model" class="form-group-hint group-required">
                Choose a proposal as base of your train
            </div>
        </div>

        <div>
            <button type="submit" class="btn btn-xs btn-primary" :disabled="$v.form.$invalid || busy" @click.prevent="add">
                <i class="fa fa-plus"></i> create
            </button>
        </div>
    </form>
</template>
