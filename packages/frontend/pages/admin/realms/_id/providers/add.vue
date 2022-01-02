<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import ProviderForm from '../../../../../components/domains/provider/ProviderForm';

export default {
    components: { ProviderForm },
    props: {
        parentItem: Object,
    },
    methods: {
        async handleCreated(e) {
            await this.$nuxt.$router.push(`/admin/realms/${this.parentItem.id}/providers/${e.id}`);
        },
    },
};
</script>
<template>
    <provider-form
        :realm-id="parentItem.id"
        @created="handleCreated"
    />
</template>
