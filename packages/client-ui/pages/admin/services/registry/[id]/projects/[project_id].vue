<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainType } from '@personalhealthtrain/core';
import type { FieldsBuildInput } from 'rapiq';
import type { PropType } from 'vue';
import type {
    Registry,
    RegistryProject,
} from '@personalhealthtrain/core';
import { RegistryProjectForm, createEntityManager } from '@personalhealthtrain/client-vue';
import { useToast } from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';

export default defineNuxtComponent({
    components: { RegistryProjectForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    async setup(props) {
        const toast = useToast();
        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY_PROJECT}`,
            props: {
                entityId: route.params.id as string,
            },
            queryFields: [
                '+account_id',
                '+account_name',
                '+account_secret',
                '+webhook_exists',
                '+external_name',
            ] as FieldsBuildInput<RegistryProject>,
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            },
            onUpdated() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The project was successfully updated.' });
                }
            },
            onDeleted() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The project was successfully deleted.' });
                }

                return navigateTo(`/admin/registries/${props.entity.id}/projects`);
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            await navigateTo({ path: `/admin/registries/${route.params.id}/projects` });
            throw createError({});
        }

        return {
            childEntity: manager.data.value,
            handleUpdated: manager.updated,
            handleFailed: manager.failed,
            handleDeleted: manager.deleted,
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
