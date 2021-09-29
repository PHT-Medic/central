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
            default: undefined
        },
        pathSelected: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        drop() {
            this.$emit('drop', this.file);
        }
    },
    computed: {
        path() {
            let filename = this.file.name;
            if(typeof this.file.webkitRelativePath !== 'undefined') {
                filename = this.file.webkitRelativePath;
            }
            return filename;
        }
    }
}
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading">
            <i class="fafa-file-upload text-info"></i>
        </div>
        <div class="card-body">
            <span class="title">
                {{path}}
                <small class="text-muted">{{file.size}} Bytes</small>
            </span>
        </div>
        <div class="card-footer d-flex flex-row align-items-center">
            <a href="javascript:void(0)" @click.prevent="drop" style="margin-top: 0.125rem; margin-right: .75rem">
                <i class="fa fa-times"></i>
            </a>
        </div>
    </div>
</template>
