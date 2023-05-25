<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useToast } from 'bootstrap-vue-next';
import { ref, toRefs } from 'vue';
import type { PropType, Ref } from 'vue';
import type {
    Registry,
    RegistryProject,
} from '@personalhealthtrain/central-common';
import { useAPI } from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import RegistryProjectForm from '../../../../../../components/domains/registry-project/RegistryProjectForm';

export default defineNuxtComponent({
    components: { RegistryProjectForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    async setup(props) {
        const refs = toRefs(props);

        let childEntity : Ref<RegistryProject>;

        const toast = useToast();
        const route = useRoute();

        try {
            const { data: stations } = await useAPI().registryProject.getMany({
                filter: {
                    id: route.params.project_id as string,
                },
                fields: [
                    '+account_id',
                    '+account_name',
                    '+account_secret',
                    '+webhook_exists',
                    '+external_name',
                ],
            });

            const station = stations.pop();
            if (!station) {
                throw new Error();
            }

            childEntity = ref(station);
        } catch (e) {
            await navigateTo({ path: `/admin/registries/${route.params.id}/projects` });
            throw createError({});
        }

        const handleUpdated = () => {
            toast.success({ body: 'The project was successfully updated.' });
        };

        const handleDeleted = async () => {
            toast.success({ body: 'The project was successfully deleted.' });

            await navigateTo(`/admin/registries/${refs.entity.value.id}/projects`);
        };

        const handleFailed = (e: Error) => {
            toast.danger({ body: e.message });
        };

        return {
            entity: refs.entity,
            childEntity,
            handleUpdated,
            handleFailed,
            handleDeleted,
        };
    },
});
</script>
<template>
    <RegistryProjectForm
        v-if="childEntity"
        :entity="childEntity"
        :registry-id="entity.id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
