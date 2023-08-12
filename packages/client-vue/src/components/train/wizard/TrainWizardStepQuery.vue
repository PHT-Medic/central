<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train } from '@personalhealthtrain/central-common';
import useVuelidate from '@vuelidate/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

export default defineComponent({
    props: {
        train: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['changed'],
    setup(props, { emit }) {
        const refs = toRefs(props);
        const form = reactive({
            query: '',
        });

        const $v = useVuelidate({
            query: {

            },
        }, form);

        const query = computed(() => refs.train.value.query);
        watch(query, (value, oldValue) => {
            if (value && value !== oldValue) {
                form.query = value;
            }
        });

        if (refs.train.value.query) {
            form.query = refs.train.value.query;
        }

        const update = () => {
            emit('changed', form.query);
        };

        return {
            update,
            v$: $v,
        };
    },
});
</script>
<template>
    <div>
        <h6>FHIR 🔥</h6>

        <div class="form-group">
            <label>Query</label>
            <textarea
                v-model="v$.query.$model"
                rows="8"
                class="form-control"
                placeholder="{...}"
                @change.prevent="update"
            />
        </div>

        <div class="alert alert-info alert-sm">
            By providing a query the local station FHIR server will receive this as payload during the train run.
        </div>
    </div>
</template>
