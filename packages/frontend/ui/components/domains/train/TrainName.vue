<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        entityId: String,
        entityName: {
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
            return this.entityName ?? this.entityId;
        },
    },
    watch: {
        entityName(val, oldVal) {
            if (val && val !== oldVal) {
                if (val) {
                    this.form.name = val;
                }
            }
        },
    },
    created() {
        if (this.entityName) {
            this.form.name = this.entityName;
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
                const train = await this.$api.train.update(this.entityId, {
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
                :entity-id="entityId"
                :entity-name="entityName"
                :display-text="displayText"
            >

                {{ displayText }}
                <template v-if="entityName">
                    <small class="text-muted">{{ entityId }}</small>
                </template>
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
