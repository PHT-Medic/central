<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
        <slot
            :classSuffix="classSuffix"
            :statusText="statusText"
        >
            <span :class="'text-'+classSuffix"> {{ statusText }}</span>
        </slot>
    </span>
</template>
<script>
import { TrainConfigurationStatus } from '@personalhealthtrain/ui-common';

export default {
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainConfigurationStatus.BASE_CONFIGURED:
                    return 'base configured';
                case TrainConfigurationStatus.SECURITY_CONFIGURED:
                    return 'security configured';
                case TrainConfigurationStatus.RESOURCE_CONFIGURED:
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
                case TrainConfigurationStatus.BASE_CONFIGURED:
                case TrainConfigurationStatus.SECURITY_CONFIGURED:
                case TrainConfigurationStatus.RESOURCE_CONFIGURED:
                case TrainConfigurationStatus.HASH_SIGNED:
                case TrainConfigurationStatus.HASH_GENERATED:
                    return 'primary';
                case TrainConfigurationStatus.FINISHED:
                    return 'success';
                default:
                    return 'info';
            }
        },
        iconClass() {
            switch (this.status) {
                case TrainConfigurationStatus.BASE_CONFIGURED:
                    return 'fas fa-cog';
                case TrainConfigurationStatus.SECURITY_CONFIGURED:
                    return 'fa fa-key';
                case TrainConfigurationStatus.RESOURCE_CONFIGURED:
                    return 'fa fa-clone';
                case TrainConfigurationStatus.HASH_GENERATED:
                    return 'fa fa-signature';
                case TrainConfigurationStatus.HASH_SIGNED:
                    return 'fa fa-signature';
                case TrainConfigurationStatus.FINISHED:
                    return 'fa fa-sign';
                default:
                    return '';
            }
        },
    },
};
</script>
