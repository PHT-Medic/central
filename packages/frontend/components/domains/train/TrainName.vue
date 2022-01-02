<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { editAPITrain } from '@personalhealthtrain/ui-common';

export default {
    props: {
        trainId: String,
        trainName: {
            type: String,
            default: undefined,
        },

        withEdit: Boolean,
    },
    data() {
        return {
            busy: false,
            form: {
                name: '',
            },
            editView: false,
        };
    },
    computed: {
        displayText() {
            return this.trainName ?? this.trainId;
        },
    },
    watch: {
        trainName(val, oldVal) {
            if (val && val !== oldVal) {
                if (val) {
                    this.form.name = val;
                }
            }
        },
    },
    created() {
        if (this.trainName) {
            this.form.name = this.trainName;
        }
    },
    methods: {
        toggleEditView() {
            this.editView = !this.editView;
        },
        async save(close = false) {
            if (this.busy) return;

            this.busy = true;

            try {
                const train = await editAPITrain(this.trainId, {
                    name: this.form.name,
                });

                this.$emit('updated', train);

                if (close) {
                    this.editView = false;
                }
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <span>
        <template v-if="editView">
            <input
                v-model="form.name"
                :disabled="busy"
                type="text"
                class="form-control"
                placeholder="Name..."
                @keyup.enter.prevent="save"
            >
        </template>
        <template v-else>
            <slot
                name="text"
                :trainId="trainId"
                :trainName="trainName"
                :display-text="displayText"
            >

                {{ displayText }}
            </slot>

            <a
                v-if="withEdit"
                class="ml-1"
                href="javascript:void(0)"
                :disabled="busy"
                @click.prevent="toggleEditView"
            >
                <i class="fas fa-pencil-alt" />
            </a>
        </template>
    </span>
</template>
