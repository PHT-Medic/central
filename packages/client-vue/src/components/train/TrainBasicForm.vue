<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal, Train } from '@personalhealthtrain/core';
import { DomainType, TrainType } from '@personalhealthtrain/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type { BuildInput } from 'rapiq';
import useVuelidate from '@vuelidate/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, ref,
} from 'vue';
import type { FormSelectOption } from '@vuecs/form-controls';
import { VCFormInput, VCFormSelect } from '@vuecs/form-controls';
import {
    createEntityManager, defineEntityManagerEvents, useValidationTranslator, wrapFnWithBusyState,
} from '../../core';
import ProposalList from '../proposal/ProposalList';
import ProposalItem from '../proposal/ProposalItem';

export default defineComponent({
    components: {
        VCFormInput, VCFormSelect, ProposalList, ProposalItem,
    },
    props: {
        entity: {
            type: Object as PropType<Train>,
        },
        proposalId: {
            type: String as PropType<string | undefined | null>,
        },
        realmId: {
            type: String,
        },
    },
    emits: defineEntityManagerEvents<Train>(),
    setup(props, setup) {
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

        const proposalQuery = computed<BuildInput<Proposal>>(() => ({
            filters: {
                ...(props.realmId ? { realm_id: props.realmId } : {}),
            },
        }));

        if (props.proposalId) {
            form.proposal_id = props.proposalId as string;
        }

        const manager = createEntityManager({
            type: `${DomainType.TRAIN}`,
            setup,
            props,
        });

        const add = wrapFnWithBusyState(busy, async () => {
            await manager.createOrUpdate(form);
        });

        const toggle = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const types : FormSelectOption[] = [
            { id: TrainType.ANALYSE, value: 'Analysis' },
            { id: TrainType.DISCOVERY, value: 'Discovery' },
        ];

        const translator = useValidationTranslator();

        return {
            v$: $v,
            form,
            add,
            toggle,
            proposalQuery,
            types,
            busy,
            translator,
        };
    },
});
</script>
<template>
    <form @submit.prevent="add">
        <div class="row">
            <div class="col">
                <VCFormGroup
                    :validation-translator="translator"
                    :validation-result="v$.name"
                >
                    <template #label>
                        Name
                    </template>
                    <template #default>
                        <VCFormInput
                            v-model="v$.name.$model"
                        />
                    </template>
                </VCFormGroup>

                <hr>

                <VCFormGroup
                    :validation-translator="translator"
                    :validation-result="v$.type"
                >
                    <template #label>
                        Type
                    </template>
                    <template #default>
                        <VCFormSelect
                            v-model="v$.type.$model"
                            :options="types"
                        />
                    </template>
                </VCFormGroup>

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
                    <template #header>
                        <label>Proposals</label>
                    </template>
                    <template #item="props">
                        <proposal-item
                            :key="props.data.id"
                            :entity="props.data"
                            @updated="props.updated"
                            @deleted="props.deleted"
                        >
                            <template #itemActions>
                                <button
                                    :disabled="props.busy"
                                    type="button"
                                    class="btn btn-xs"
                                    :class="{
                                        'btn-dark': form.proposal_id !== props.data.id,
                                        'btn-warning': form.proposal_id === props.data.id
                                    }"
                                    @click.prevent="toggle('proposal_id', props.data.id)"
                                >
                                    <i
                                        :class="{
                                            'fa fa-plus': form.proposal_id !== props.data.id,
                                            'fa fa-minus': form.proposal_id === props.data.id
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
