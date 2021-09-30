<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>
import {TrainConfigurationStatus} from "../../../domains/train";

export default {
    props: {
        status: {
            type: String,
            default: null
        }
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainConfigurationStatus.FILES_UPLOADED:
                    return 'files uploaded';
                case TrainConfigurationStatus.HASH_GENERATED:
                    return 'hash generated';
                case TrainConfigurationStatus.HASH_SIGNED:
                    return 'hash signed';
                case TrainConfigurationStatus.FINISHED:
                    return 'finished';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainConfigurationStatus.FILES_UPLOADED:
                case TrainConfigurationStatus.HASH_GENERATED:
                case TrainConfigurationStatus.HASH_SIGNED:
                    return 'primary';
                case TrainConfigurationStatus.FINISHED:
                    return 'success';
                default:
                    return 'info';
            }
        }
    }
}
</script>
