<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    addAPIUserKeyRing,
    dropAPIUserKeyRing,
    editAPIUserKeyRing,
    getAPIUserSecrets,
} from '@personalhealthtrain/ui-common';
import { maxLength, minLength, numeric } from 'vuelidate/lib/validators';
import AlertMessage from '../../alert/AlertMessage';

export default {
    components: { AlertMessage },
    props: {
        userProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            item: undefined,
            busy: false,
            form: {
                public_key: '',
                he_key: '',
            },
            formMeta: {
                busy: false,
            },
            message: undefined,
        };
    },
    validations: {
        form: {
            public_key: {
                minLength: minLength(5),
                maxLength: maxLength(4096),
            },
            he_key: {
                numeric,
                minLength: minLength(5),
                maxLength: maxLength(4096),
            },
        },
    },
    computed: {
        exists() {
            return typeof this.item !== 'undefined';
        },
        public_keyExists() {
            return this.exists && !!this.item.public_key && this.item.public_key !== '';
        },
        he_keyExists() {
            return this.exists && !!this.item.he_key && this.item.he_key !== '';
        },
    },
    created() {
        this.load().then((r) => r);
    },
    methods: {
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                this.item = await getAPIUserSecrets();

                this.form.public_key = this.item.public_key;
                this.form.he_key = this.item.he_key;
            } catch (e) {

            }

            this.busy = false;
        },
        async submit() {
            if (this.busy) return;

            this.busy = true;

            this.message = undefined;

            try {
                if (typeof this.item !== 'undefined') {
                    this.item = await editAPIUserKeyRing(this.item.id, this.form);

                    this.$emit('updated', this.item);
                    this.message = {
                        data: 'The keys are now updated.',
                        isError: false,
                    };
                } else {
                    this.item = await addAPIUserKeyRing(this.form);

                    this.$emit('created', this.item);
                    this.message = {
                        data: 'The keys are now uploaded.',
                        isError: false,
                    };
                }
            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true,
                };
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy) return;

            this.busy = true;

            try {
                await dropAPIUserKeyRing(this.item.id);

                this.item = undefined;
                this.form.public_key = '';
                this.form.he_key = '';
            } catch (e) {

            }

            this.busy = false;
        },
        readPublicFile() {
            this.formMeta.busy = true;

            const file = this.$refs.myPublicKey.files[0];

            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                this.form.public_key = evt.target.result;
                this.formMeta.busy = false;
                this.$refs.myPublicKey.value = '';
            };
            reader.onerror = (evt) => {
                this.formMeta.busy = false;
                this.$refs.myPublicKey.value = '';
            };
        },
    },
};
</script>
<template>
    <div class="">
        <div
            v-if="!exists"
            class="alert-sm m-b-20"
            :class="{'alert-warning': !public_keyExists || !he_keyExists, 'alert-info': public_keyExists && he_keyExists}"
        >
            Please upload your <strong>public-key</strong>. It will be used for the creation of a train.
            In addition you can also provide an he-key.
        </div>

        <alert-message :message="message" />

        <form @submit.prevent="submit">
            <div class="row">
                <div class="col">
                    <h6>1. Public-Key <i class="fa fa-key text-success" /></h6>

                    <div class="form-group">
                        <template v-if="busy">
                            <div class="fa-3x">
                                <i class="fas fa-cog fa-spin" />
                            </div>
                        </template>
                        <template v-else>
                            <textarea
                                v-model="$v.form.public_key.$model"
                                class="form-control"
                                rows="8"
                                placeholder="public key..."
                            />
                        </template>
                    </div>

                    <div class="form-group">
                        <div class="custom-file">
                            <input
                                id="userPublicKey"
                                ref="myPublicKey"
                                type="file"
                                class="custom-file-input"
                                @change.prevent="readPublicFile"
                            >
                            <label
                                class="custom-file-label"
                                for="userPublicKey"
                            >Select public key...</label>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <h6>2. He-Key <i class="fa fa-key text-success" /></h6>

                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.form.he_key.$anyError }"
                    >
                        <template v-if="busy">
                            <div class="fa-3x">
                                <i class="fas fa-cog fa-spin" />
                            </div>
                        </template>
                        <template v-else>
                            <textarea
                                v-model="$v.form.he_key.$model"
                                class="form-control"
                                rows="8"
                                placeholder="he key..."
                            />
                        </template>

                        <div
                            v-if="!$v.form.he_key.numeric"
                            class="form-group-hint group-required"
                        >
                            The value of the field he_key must be numeric.
                        </div>
                    </div>

                    <div class="form-group">
                        <button
                            :disabled="formMeta.busy || busy"
                            type="button"
                            class="btn btn-sm btn-primary"
                            @click.prevent="submit"
                        >
                            <i class="fa fa-save" /> {{ exists ? 'Change' : 'Create' }}
                        </button>
                        <button
                            v-if="exists"
                            :disabled="formMeta.busy || busy"
                            type="button"
                            class="btn btn-sm btn-dark"
                            @click.prevent="drop"
                        >
                            <i class="fa fa-times" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>
