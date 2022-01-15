<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import ProviderForm from '../../../../../components/domains/auth/provider/ProviderForm';

export default {
    components: { ProviderForm },
    props: {
        parentItem: {
            type: Object,
            default: undefined,
        },
    },
    async asyncData(context) {
        try {
            const item = await context.$authApi.oauth2Provider.getOne(context.params.provider_id, {
                fields: ['+client_secret'],
            });

            return {
                item,
            };
        } catch (e) {
            await context.redirect(`/admin/realms/${this.parentItem.id}/providers`);

            return {

            };
        }
    },
    data() {
        return {
            item: undefined,
        };
    },
    methods: {
        handleUpdated(item) {
            for (const key in item) {
                Vue.set(this.item, key, item[key]);
            }
        },
    },
};
</script>
<template>
    <provider-form
        :provider="item"
        :realm-id="parentItem.id"
        @updated="handleUpdated"
    />
</template>
