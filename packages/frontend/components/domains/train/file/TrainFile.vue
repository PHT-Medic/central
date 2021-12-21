<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        file: {
            type: Object,
            default: undefined,
        },
        filesSelected: {
            type: Array,
            default: [],
        },
        train: {
            type: Object,
            default: undefined,
        },
        fileSelectedId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        path() {
            return `${this.file.directory}/${this.file.name}`;
        },
        check() {
            return this.filesSelected.findIndex((file) => file === this.file.id) !== -1;
        },
        isIdleFile() {
            return this.fileSelectedId === this.file.id;
        },
    },
    methods: {
        toggleEnabled() {
            this.$emit('toggle', this.file);
        },
        checkFile() {
            this.$emit('check', {
                ...this.file,
            });
        },
    },
};
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading align-items-center d-flex">
            <div class="form-check">
                <input
                    type="checkbox"
                    :checked="check"
                    :disabled="isIdleFile"
                    class="form-check-input"
                    style="position: relative; margin-top: .6rem;"
                    @change="checkFile"
                >
            </div>
            <div>
                <i
                    :class="{'fas fa-terminal text-warning': isIdleFile, 'fa fa-file-alt': !isIdleFile}"
                    class="ml-1"
                />
            </div>
        </div>
        <div class="card-body">
            <span class="title">
                {{ path }}
                <small class="text-muted">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ml-auto">
            <b-form-checkbox
                switch
                :checked="isIdleFile"
                @change="toggleEnabled"
            />
        </div>
    </div>
</template>
