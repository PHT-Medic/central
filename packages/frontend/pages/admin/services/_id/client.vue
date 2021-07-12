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
