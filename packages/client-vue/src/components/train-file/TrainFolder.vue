<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: String,
            default: 'Unknown',
        },
    },
});
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading">
            <i class="fa fa-folder" />
        </div>
        <div class="card-body">
            <span class="title">{{ name }}</span>
        </div>
        <div class="card-footer">
            <i class="fa fa-info" />
        </div>
    </div>
</template>
