<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue, { PropType } from 'vue';
import {
    Registry,
    RegistryProject,
} from '@personalhealthtrain/central-common';
import { RegistryProjectForm } from '../../../../../../components/domains/registry-project/RegistryProjectForm';

// todo: add data, prop, method typing
export default Vue.extend<any, any, any, any>({
    components: { RegistryProjectForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
    },
    async asyncData(context) {
        try {
            const { data: stations } = await context.$api.registryProject.getMany({
                filter: {
                    id: context.params.project_id,
                },
                fields: {
                    station: [
                        '+external_id',
                        '+account_id',
                        '+account_name',
                        '+account_secret',
                        '+webhook_exists',
                        '+external_name',
                    ],
                },
            });

            if (stations.length === 0) {
                await context.redirect(`/admin/services/registry/${context.params.id}/projects`);

                return {
                    childEntity: undefined,
                };
            }

            return {
                childEntity: stations[0],
            };
        } catch (e) {
            await context.redirect(`/admin/registries/${context.params.id}/projects`);

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
        handleUpdated(
            item: RegistryProject,
        ) {
            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.childEntity, keys[i], item[keys[i]]);
            }

            this.$bvToast.toast('The project was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleDeleted() {
            this.$bvToast.toast('The project was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push(`/admin/registries/${this.enitty.id}/projects`);
        },
        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
});
</script>
<template>
    <registry-project-form
        :entity="childEntity"
        :registry-id="entity.id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
