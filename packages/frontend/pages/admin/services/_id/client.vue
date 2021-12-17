<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { ServiceID } from '@personalhealthtrain/ui-common';
import ServiceClientDetails from '../../../../components/domains/service/ServiceClientDetails';

export default {
    components: { ServiceClientDetails },
    props: {
        serviceId: ServiceID,
    },
    data() {
        return {

        };
    },
    methods: {
        handleUpdated(event) {
            this.$emit('updated', event);
        },
    },
};
</script>
<template>
    <service-client-details
        :service-id="serviceId"
        @updated="handleUpdated"
    />
</template>
