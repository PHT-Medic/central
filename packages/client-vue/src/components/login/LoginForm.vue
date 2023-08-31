<script lang="ts">
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { isClientError } from 'hapic';
import {
    defineComponent, reactive, ref, toRef, watch,
} from 'vue';
import { FormInput, FormSubmit } from '@vue-layout/form-controls';
import { injectAuthupStore, useValidationTranslator } from '../../core';

export default defineComponent({
    components: {
        FormInput,
        FormSubmit,
    },
    props: {
        realmId: {
            type: String,
        },
    },
    emits: ['done', 'failed'],
    setup(props, { emit }) {
        const realmId = toRef(props, 'realmId');

        const form = reactive({
            name: '',
            password: '',
            realm_id: '',
        });

        if (realmId.value) {
            form.realm_id = realmId.value;
        }

        watch(realmId, (val) => {
            form.realm_id = val;
        });

        const vuelidate = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            password: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            realm_id: {

            },
        }, form);

        const store = injectAuthupStore();

        const busy = ref(false);

        const submit = async () => {
            try {
                await store.login({
                    name: form.name,
                    password: form.password,
                    realmId: form.realm_id,
                });

                emit('done');
            } catch (e: any) {
                if (isClientError(e)) {
                    emit('failed', e);
                }
            }
        };

        Promise.resolve()
            .then(store.logout);

        const translator = useValidationTranslator();

        return {
            vuelidate,
            translator,
            form,
            submit,
            busy,
        };
    },
});
</script>
<template>
    <form @submit.prevent="submit">
        <FormInput
            v-model="form.name"
            :validation-result="vuelidate.name"
            :validation-translator="translator"
            :label="true"
            :label-content="'Name'"
        />

        <FormInput
            v-model="form.password"
            type="password"
            :validation-result="vuelidate.password"
            :validation-translator="translator"
            :label="true"
            :label-content="'Password'"
        />

        <FormSubmit
            v-model="busy"
            :validation-result="vuelidate"
            :create-text="'Login'"
            :create-button-class="{value: 'btn btn-sm btn-dark btn-block', presets: { bootstrap: false }}"
            :create-icon-class="'fa-solid fa-right-to-bracket'"
            :submit="submit"
        />
    </form>
</template>
