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
        entity: Object,

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
            if (this.form.name && this.form.name.length > 0) {
                return this.form.name;
            }

            return this.entity.name ?? this.entity.id;
        },
    },
    created() {
        if (this.entity.name) {
            this.form.name = this.entity.name;
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
                const train = await editAPITrain(this.entity.id, {
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
            <slot name="text"
                  :entity="entity"
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
                <i class="fas fa-toggle-off" />
            </a>
        </template>
    </span>
</template>
