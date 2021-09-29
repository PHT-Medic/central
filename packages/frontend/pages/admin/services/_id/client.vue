<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import ServiceClientDetails from "~/components/service/ServiceClientDetails";

export default {
    components: {ServiceClientDetails},
    props: {
        service: Object
    },
    methods: {
        handleUpdated(event) {
            this.$emit('updated', event);
        }
    },
    data() {
        return {

        }
    }
}
</script>
<template>
    <service-client-details :service-property="service" @updated="handleUpdated" />
</template>
