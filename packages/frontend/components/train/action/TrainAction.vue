<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <slot name="body" v-bind:classSuffix="classSuffix" v-bind:iconClass="iconClass">
        <button class="btn btn-xs" :class="'btn-'+classSuffix" @click.prevent="doAction" :disabled="!isValidStatus || !isPermitted">
            <slot name="text">
                <i :class="iconClass"></i>
            </slot>
        </button>
    </slot>
</template>
<script>
import {runAPITrainCommand} from "@personalhealthtrain/ui-common";

export default {
    props: {
        trainId: String,
        train_stations: Array,
        task: String
    },
    data() {
        return {
            busy: false
        }
    },
    methods: {
        async doAction() {
            if(this.busy) return;

            this.busy = true;

            try {
                const train = await runAPITrainCommand(this.train.id, this.task);
                this.$emit('done', train);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        }
    },
    computed: {
        isValidStatus() {

        },
        isPermitted() {
            switch (this.task) {
                case '':
                    break;
            }

            return this.$auth.can('start','trainExecution');
        },
        classSuffix() {
            switch (this.task) {
                case 'build':
                    return 'outline-dark';
                case 'start':
                    return 'primary';
                case 'stop':
                    return 'danger';
            }
        },
        iconClass() {
            switch (this.task) {
                case 'build':
                    return 'fa fa-wrench';
                case 'start':
                    return 'fa fa-play';
                case 'stop':
                    return 'fa fa-stop';
            }
        }
    }
}
</script>
