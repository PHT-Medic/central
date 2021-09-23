<script>
import AlertMessage from "@/components/alert/AlertMessage";
import {runTrainCommand} from "@/domains/train/api.ts";
export default {
    components: {AlertMessage},
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            form: {
                hashSigned: '',
                hash: '',
            },
            formInfo: {
                message: undefined
            },
            busy: false
        }
    },
    created() {
        if(typeof this.train.hash !== 'undefined' && this.train.hash) {
            this.form.hash = this.train.hash;
        }
        if(typeof this.train.hashSigned !== 'undefined' && this.train.hashSigned) {
            this.form.hashSigned = this.train.hashSigned;
        }
    },
    methods: {
        async generate() {
            if(this.busy) return;

            this.busy = true;

            try {
                const train = await runTrainCommand(this.train.id, 'generateHash');

                this.setHash(train.hash);
                this.$emit('hashGenerated', this.form.hash);
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },

        //------------------------------------

        setHash(value) {
            this.form.hash = value;
        },
        setHashSigned(value) {
            this.form.hash = value;
        },
        reset() {
            this.form.hash = null;
            this.form.hashSigned = null;
        },

        //---------------------------------

        handleHashSigned() {
            this.$emit('setHashSigned', this.form.hashSigned);
        }
    },
    computed: {
        hashExists() {
            return !!this.form.hash && this.form.hash !== '';
        }
    }
}
</script>
<template>
    <div>
        <div class="d-flex text-center flex-column align-items-center justify-content-center">
            <div style="font-size: 2rem;">
                <i class="fa" :class="{
                    'fa fa-check text-success': hashExists,
                    'fa-circle-notch text-info fa-spin': !hashExists && busy,
                    'fa fa-exclamation text-warning': !hashExists && !busy
                }"></i>
                <h6>Hash
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
            <div  v-if="!hashExists">
                <p>
                    The hash will be created with your public key over the configuration of the train. <br />
                    This task may take a while...
                </p>
                <button type="button" class="btn btn-primary btn-sm" :disabled="busy" @click.prevent="generate">
                    <i class="fas fa-hammer"></i> Generate
                </button>
            </div>
        </div>

        <hr class="m-t-10"/>

        <div class="form-group">
            <label>Hash</label>
            <input type="text" class="form-control" :value="form.hash" :disabled="true" />
        </div>

        <hr />

        <div class="alert alert-info alert-sm m-t-10 m-b-10">
            Please sign the hash displayed above with the pht offline
            and pass it in the textarea below.
        </div>

        <div class="form-group">
            <label>Signed Hash</label>
            <textarea class="form-control" v-model="form.hashSigned" @change.prevent="handleHashSigned" placeholder="Signed hash of the pht offline tool..." rows="4" />
        </div>
    </div>
</template>
