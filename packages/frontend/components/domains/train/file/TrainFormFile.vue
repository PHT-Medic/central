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
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading">
            <i class="fa fa-file-upload text-info" />
        </div>
        <div class="card-body">
            <span class="title">
                {{ path }}
                <small class="text-muted">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ml-auto">
            <a
                href="javascript:void(0)"
                style="margin-right: .75rem"
                @click.prevent="drop"
            >
                <i class="fa fa-times" />
            </a>
        </div>
    </div>
</template>
