<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue, { PropType } from 'vue';
import { Realm } from '@authelion/common';

export default Vue.extend({
    props: {
        entity: {
            type: Object as PropType<Realm>,
            default: undefined,
        },
    },
    async asyncData(context) {
        try {
            const childEntity = await context.$authApi.oauth2Provider.getOne(context.params.provider_id, {
                fields: ['+client_secret'],
            });

            return {
                childEntity,
            };
        } catch (e) {
            await context.redirect('/settings/realm/providers');

            return {

            };
        }
    },
    data() {
        return {
            childEntity: undefined,
        };
    },
    methods: {
        handleUpdated(item) {
            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.childEntity, keys[i], item[keys[i]]);
            }

            this.$bvToast.toast('The provider was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
    },
});
</script>
<template>
    <o-auth2-provider-form
        :entity="childEntity"
        :realm-id="entity.id"
        @updated="handleUpdated"
    />
</template>
