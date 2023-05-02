<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train } from '@personalhealthtrain/central-common';
import { TrainType } from '@personalhealthtrain/central-common';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type { BuildInput } from 'rapiq';
import useVuelidate from '@vuelidate/core';
import {
    computed, reactive, ref, toRefs,
} from 'vue';
import { wrapFnWithBusyState } from '../../../core/busy';
import ProposalList from '../proposal/ProposalList';
import ProposalItem from '../proposal/ProposalItem';

export default {
    components: { ProposalList, ProposalItem },
    props: {
        proposalId: {
            type: String,
        },
        realmId: {
            type: String,
        },
    },
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            type: TrainType.DISCOVERY,
            proposal_id: '',
            name: '',
        });

        const $v = useVuelidate({
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
        }, form);

        const proposalQuery = computed<BuildInput<Train>>(() => ({
            filter: {
                ...(refs.realmId.value ? { realm_id: refs.realmId.value } : {}),
            },
        }));

        if (refs.proposalId.value) {
            form.proposal_id = refs.proposalId.value as string;
        }

        const add = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await this.$api.train.create(form);
                emit('created', train);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const toggle = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const types = [
            { id: TrainType.ANALYSE, name: 'Analysis' },
            { id: TrainType.DISCOVERY, name: 'Discovery' },
        ];

        return {
            v$: $v,
            form,
            add,
            toggle,
            proposalQuery,
            types,
            busy,
        };
    },
};
</script>
<template>
    <form @submit.prevent="add">
        <div class="row">
            <div class="col">
                <div
                    class="form-group"
                    :class="{ 'form-group-error': v$.name.$error }"
                >
                    <label>Name <small class="text-muted">(optional)</small></label>
                    <input
                        v-model="v$.name.$model"
                        type="text"
                        class="form-control"
                        placeholder="..."
                    >

                    <div
                        v-if="!v$.name.minLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be greater than <strong>{{ v$.name.$params.minLength.min }}</strong> characters.
                    </div>
                    <div
                        v-if="!v$.name.maxLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be less than <strong>{{ v$.name.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <hr>

                <div class="form-group">
                    <label>Type</label>
                    <select
                        v-model="v$.type.$model"
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
                        v-if="!v$.type.required && !v$.type.$model"
                        class="form-group-hint group-required"
                    >
                        Choose one of the available train types...
                    </div>
                </div>
                <div
                    v-if="v$.type.$model"
                    class="alert alert-secondary alert-sm"
                >
                    <template v-if="v$.type.$model === 'analyse'">
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
                        :disabled="v$.$invalid || busy"
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
                    <template #header-title>
                        <label>Proposals</label>
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
                                        'btn-dark': form.proposal_id !== itemActionProps.item.id,
                                        'btn-warning': form.proposal_id === itemActionProps.item.id
                                    }"
                                    @click.prevent="toggle('proposal_id', itemActionProps.item.id)"
                                >
                                    <i
                                        :class="{
                                            'fa fa-plus': form.proposal_id !== itemActionProps.item.id,
                                            'fa fa-minus': form.proposal_id === itemActionProps.item.id
                                        }"
                                    />
                                </button>
                            </template>
                        </proposal-item>
                    </template>
                </proposal-list>

                <div
                    v-if="!v$.proposal_id.required && !v$.proposal_id.$model"
                    class="alert alert-sm alert-warning"
                >
                    Choose a proposal as base of your train
                </div>
            </div>
        </div>
    </form>
</template>
