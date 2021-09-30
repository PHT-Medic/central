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
    getAPIUserKeyRing,
    User
} from "@personalhealthtrain/ui-common";
import {maxLength, minLength, required} from "vuelidate/lib/validators";
import AlertMessage from "../../components/alert/AlertMessage";

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
                content: '',
                busy: false
            },
            message: undefined
        }
    },
    validations: {
        form: {
            content: {
                required,
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
                this.item = await getAPIUserKeyRing();
                this.form.content = this.item.content;
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
                    this.item = await editAPIUserKeyRing(this.item.id, {
                        public_key: this.form.content
                    });

                    this.$emit('updated', this.item);
                    this.message = {
                        data: 'The public key is now updated.',
                        isError: false
                    }
                } else {
                    this.item = await addAPIUserKeyRing({
                        content: this.form.content
                    });

                    this.$emit('created', this.item);
                    this.message = {
                        data: 'The public key is now uploaded.',
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
                await dropAPIUserKeyRing(this.item.id);

                this.item = undefined;
                this.form.content = '';
            } catch (e) {

            }

            this.busy = false;
        },
        readFile() {
            this.form.busy = true;

            let file = this.$refs.myFile.files[0];

            let reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                this.form.content = evt.target.result;
                this.form.busy = false;
                this.$refs.myFile.value = '';
            };
            reader.onerror = (evt) => {
                this.form.busy = false;
                this.$refs.myFile.value = '';
            };
        }
    },
    computed: {
        exists() {
            return typeof this.item !== 'undefined';
        },
        fieldIsEmpty() {
            return this.form.content === '' || !this.form.content;
        }
    }
}
</script>
<template>
    <div>
        <div v-if="!exists" class="alert-sm m-b-20" :class="{'alert-warning': fieldIsEmpty, 'alert-info': !fieldIsEmpty}">
            Please upload your <strong>public key</strong>. It will be used for the creation of a train.
        </div>

        <alert-message :message="message" />

        <form @submit.prevent="submit">
            <div class="form-group">
                <div class="custom-file">
                    <input ref="myFile" @change.prevent="readFile" type="file" class="custom-file-input" id="userPublicKey">
                    <label class="custom-file-label" for="userPublicKey">Public Key auswählen...</label>
                </div>
            </div>
            <div class="form-group">
                <template v-if="busy">
                    <div class="fa-3x">
                        <i class="fas fa-cog fa-spin"></i>
                    </div>
                </template>
                <template v-else>
                    <textarea class="form-control" v-model="$v.form.content.$model" rows="8"></textarea>
                </template>
            </div>
            <div class="form-group">
                <button @click.prevent="submit" :disabled="form.busy || busy" type="button" class="btn btn-xs btn-primary">
                    <i class="fa fa-save"></i> {{ exists ? 'Change' : 'Upload' }}
                </button>
                <button v-if="exists" @click.prevent="drop" :disabled="form.busy || busy" type="button" class="btn btn-xs btn-danger">
                    <i class="fa fa-times"></i> Delete
                </button>
            </div>
        </form>
    </div>
</template>
