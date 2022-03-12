<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue, { PropType } from 'vue';
import { Realm } from '@authelion/common';
import { StationForm } from '../../../../../components/domains/station/StationForm';

export default Vue.extend({
    components: { StationForm },
    props: {
        entity: {
            type: Object as PropType<Realm>,
            default: undefined,
        },
    },
    async asyncData(context) {
        try {
            const { data: stations } = await context.$api.station.getMany({
                filter: {
                    id: context.params.station_id,
                },
                fields: {
                    station: [
                        '+registry_project_id',
                        '+registry_project_account_id',
                        '+registry_project_account_name',
                        '+registry_project_account_token',
                        '+registry_project_webhook_exists',
                        '+public_key',
                        '+email',
                        '+secure_id',
                    ],
                },
            });

            if (stations.length === 0) {
                return {
                    childEntity: undefined,
                };
            }

            return {
                childEntity: stations[0],
            };
        } catch (e) {
            await context.redirect(`/admin/realms/${context.params.id}/stations`);

            return {
                childEntity: undefined,
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

            this.$bvToast.toast('The station was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleDeleted() {
            this.$bvToast.toast('The station was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push(`/admin/realms/${this.enitty.id}/stations`);
        },
    },
});
</script>
<template>
    <station-form
        :entity="childEntity"
        :realm-id="entity.id"
        @updated="handleUpdated"
    />
</template>
