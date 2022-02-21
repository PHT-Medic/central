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
            default: undefined,
        },
        pathSelected: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        path() {
            let filename = this.file.name;
            if (typeof this.file.webkitRelativePath !== 'undefined') {
                filename = this.file.webkitRelativePath;
            }
            return filename;
        },
    },
    methods: {
        drop() {
            this.$emit('drop', this.file);
        },
    },
};
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center p-1">
        <div class="card-heading">
            <span class="title">
                {{ path }}
                <small class="text-muted ml-1">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ml-auto">
            <button
                type="button"
                class="btn btn-dark btn-xs"
                @click.prevent="drop"
            >
                <i class="fa fa fa-trash" />
            </button>
        </div>
    </div>
</template>
