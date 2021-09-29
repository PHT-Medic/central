<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {addUserKeyRing, dropUserKeyRing, editUserKeyRing, getUserKeyRing} from "@/domains/user/publicKey/api.ts";
import {maxLength, minLength, numeric, required} from "vuelidate/lib/validators";
import AlertMessage from "@/components/alert/AlertMessage";

export default {
    components: {AlertMessage},
    props: {
        userProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            item: undefined,
            busy: false,
            form: {
                publicKey: '',
                heKey: ''
            },
            formMeta: {
                busy: false
            },
            message: undefined
        }
    },
    validations: {
        form: {
            publicKey: {
                minLength: minLength(5),
                maxLength: maxLength(4096)
            },
            heKey: {
                numeric,
                minLength: minLength(5),
                maxLength: maxLength(4096)
            }
        }
    },
    created() {
        this.load().then(r => r);
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                this.item = await getUserKeyRing();

                this.form.publicKey = this.item.publicKey;
                this.form.heKey = this.item.heKey;
            } catch (e) {

            }

            this.busy = false;
        },
        async submit() {
            if(this.busy) return;

            this.busy = true;

            this.message = undefined;

            try {
                if(typeof this.item !== 'undefined') {
                    this.item = await editUserKeyRing(this.item.id, this.form);

                    this.$emit('updated', this.item);
                    this.message = {
                        data: 'The keys are now updated.',
                        isError: false
                    }
                } else {
                    this.item = await addUserKeyRing(this.form);

                    this.$emit('created', this.item);
                    this.message = {
                        data: 'The keys are now uploaded.',
                        isError: false
                    }
                }

            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true
                }
            }

            this.busy = false;
        },
        async drop() {
            if(this.busy) return;

            this.busy = true;

            try {
                await dropUserKeyRing(this.item.id);

                this.item = undefined;
                this.form.publicKey = '';
                this.form.heKey = '';
            } catch (e) {

            }

            this.busy = false;
        },
        readPublicFile() {
            this.formMeta.busy = true;

            let file = this.$refs.myPublicKey.files[0];

            let reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                this.form.publicKey = evt.target.result;
                this.formMeta.busy = false;
                this.$refs.myPublicKey.value = '';
            };
            reader.onerror = (evt) => {
                this.formMeta.busy = false;
                this.$refs.myPublicKey.value = '';
            };
        }
    },
    computed: {
        exists() {
            return typeof this.item !== 'undefined';
        },
        publicKeyExists() {
            return this.exists && !!this.item.publicKey && this.item.publicKey !== '';
        },
        heKeyExists() {
            return this.exists && !!this.item.heKey && this.item.heKey !== '';
        }
    }
}
</script>
<template>
    <div class="">
        <div v-if="!exists" class="alert-sm m-b-20" :class="{'alert-warning': !publicKeyExists || !heKeyExists, 'alert-info': publicKeyExists && heKeyExists}">
            Please upload your <strong>public-key</strong>. It will be used for the creation of a train.
            In addition you can also provide an he-key.
        </div>

        <alert-message :message="message" />

        <form @submit.prevent="submit">
            <div class="row">
                <div class="col">
                    <h6>1. Public-Key <i class="fa fa-key text-success"></i></h6>

                    <div class="form-group">
                        <template v-if="busy">
                            <div class="fa-3x">
                                <i class="fas fa-cog fa-spin"></i>
                            </div>
                        </template>
                        <template v-else>
                            <textarea class="form-control" v-model="$v.form.publicKey.$model" rows="8" placeholder="public key..."></textarea>
                        </template>
                    </div>

                    <div class="form-group">
                        <div class="custom-file">
                            <input ref="myPublicKey" @change.prevent="readPublicFile" type="file" class="custom-file-input" id="userPublicKey">
                            <label class="custom-file-label" for="userPublicKey">Select public key...</label>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <h6>2. He-Key <i class="fa fa-key text-success"></i></h6>

                    <div class="form-group" :class="{ 'form-group-error': $v.form.heKey.$anyError }">
                        <template v-if="busy">
                            <div class="fa-3x">
                                <i class="fas fa-cog fa-spin"></i>
                            </div>
                        </template>
                        <template v-else>
                            <textarea class="form-control" v-model="$v.form.heKey.$model" rows="8" placeholder="he key..."></textarea>
                        </template>

                        <div v-if="!$v.form.heKey.numeric" class="form-group-hint group-required">
                            The value of the field heKey must be numeric.
                        </div>
                    </div>

                    <div class="form-group">
                        <button @click.prevent="submit" :disabled="formMeta.busy || busy" type="button" class="btn btn-sm btn-primary">
                            <i class="fa fa-save"></i> {{ exists ? 'Change' : 'Create' }}
                        </button>
                        <button v-if="exists" @click.prevent="drop" :disabled="formMeta.busy || busy" type="button" class="btn btn-sm btn-dark">
                            <i class="fa fa-times"></i> Delete
                        </button>
                    </div>
                </div>
            </div>


        </form>
    </div>
</template>
