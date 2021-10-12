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
            default: undefined
        },
        filesSelected: {
            type: Array,
            default: []
        },
        train: {
            type: Object,
            default: undefined
        },
        fileSelectedId: {
            type: String,
            default: undefined
        }
    },
    data() {
        return {
            busy: false
        }
    },
    methods: {
        toggleEnabled() {
            this.$emit('toggle', this.file);
        },
        checkFile() {
            this.$emit('check', {
                ...this.file
            });
        }
    },
    computed: {
        path() {
            return this.file.directory + '/' + this.file.name;
        },
        check() {
            return this.filesSelected.findIndex(file => file === this.file.id) !== -1;
        },
        isIdleFile() {
            return this.fileSelectedId === this.file.id;
        }
    }
}
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading align-items-center d-flex">
            <div class="form-check">
                <input type="checkbox" :checked="check" :disabled="isIdleFile" @change="checkFile" class="form-check-input" style="position: relative; margin-top: .6rem;">
            </div>
            <div>
                <i class="fa fa-file text-success ml-1"></i>
            </div>
        </div>
        <div class="card-body">
            <span class="title">
                {{path}}
                <small class="text-muted">{{file.size}} Bytes</small>
            </span>
        </div>
        <div class="ml-auto">
            <b-form-checkbox switch :checked="isIdleFile" @change="toggleEnabled"></b-form-checkbox>
        </div>
    </div>
</template>
