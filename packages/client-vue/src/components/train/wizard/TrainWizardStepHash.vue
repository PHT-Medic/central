<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { required } from '@vuelidate/validators';
import {
    computed,
    defineComponent, reactive, ref, toRefs, watch,
} from 'vue';
import type { Train } from '@personalhealthtrain/core';
import { TrainAPICommand } from '@personalhealthtrain/core';
import useVuelidate from '@vuelidate/core';
import type { PropType } from 'vue';
import { initFormAttributesFromSource, injectAPIClient, wrapFnWithBusyState } from '../../../core';

export default defineComponent({
    props: {
        train: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['signed', 'generated', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectAPIClient();
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            hash_signed: '',
            hash: '',
        });

        const $v = useVuelidate({
            hash_signed: {
                required,
            },
            hash: {

            },
        }, form);

        const init = () => {
            if (refs.train.value.hash !== form.hash) {
                initFormAttributesFromSource(form, refs.train.value);
            }
        };

        const updatedAt = computed(() => (refs.train.value ?
            refs.train.value.updated_at :
            undefined));

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                init();
            }
        });

        init();

        const hashExists = computed(() => form.hash && form.hash.length > 0);

        const copyToClipboard = () => {
            if (
                typeof navigator !== 'undefined' &&
                typeof navigator.clipboard !== 'undefined'
            ) {
                navigator.clipboard.writeText(form.hash);
            }
        };

        const generate = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await apiClient.train.runCommand(refs.train.value.id, TrainAPICommand.GENERATE_HASH);

                form.hash = train.hash;

                emit('generated', form.hash);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        //---------------------------------

        const handleHashSigned = () => {
            emit('signed', form.hash_signed);
        };

        return {
            hashExists,
            busy,
            generate,
            handleHashSigned,
            copyToClipboard,
            v$: $v,
        };
    },
});
</script>
<template>
    <div>
        <div class="d-flex text-center flex-column align-items-center justify-content-center">
            <div style="font-size: 2rem;">
                <i
                    class="fa"
                    :class="{
                        'fa fa-check text-success': hashExists,
                        'fa-circle-notch text-info fa-spin': !hashExists && busy,
                        'fa fa-exclamation text-warning': !hashExists && !busy
                    }"
                />
                <h6>
                    Hash
                    <template v-if="hashExists">
                        generated
                    </template>
                    <template v-else-if="!hashExists && busy">
                        generating...
                    </template>
                    <template v-else-if="!hashExists && !busy">
                        needs to be generated
                    </template>
                </h6>
            </div>
            <div v-if="!hashExists">
                <p>
                    The hash will be created with your public key over the configuration of the train. <br>
                    This task may take a while...
                </p>
                <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="busy"
                    @click.prevent="generate"
                >
                    <i class="fas fa-hammer" /> Generate
                </button>
            </div>
        </div>

        <hr class="m-t-10">

        <div class="form-group">
            <label class="d-flex flex-row">
                Hash

                <a
                    v-if="hashExists"
                    href="javascript:void(0)"
                    class="badge badge-dark ms-auto"
                    @click.prevent="copyToClipboard()"
                ><i class="fa fa-copy" /> Copy</a>
            </label>
            <input
                type="text"
                class="form-control"
                :value="v$.hash.$model"
                :disabled="true"
            >
        </div>

        <hr>

        <div class="alert alert-info alert-sm m-t-10 m-b-10">
            Please sign the hash displayed above with the pht offline
            and pass it in the textarea below.
        </div>

        <div class="form-group">
            <label>Signed Hash</label>

            <textarea
                v-model="v$.hash_signed.$model"
                class="form-control"
                placeholder="Signed hash of the desktop app..."
                rows="4"
                @change.prevent="handleHashSigned"
            />
        </div>
    </div>
</template>
