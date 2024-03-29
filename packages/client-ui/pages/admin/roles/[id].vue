<script lang="ts">

import type { Role } from '@authup/core';
import { PermissionName, isRealmResourceWritable } from '@authup/core';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta,
    useAuthupAPI, useToast,
} from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { useAuthStore } from '../../../store/auth';
import { updateObjectProperties } from '../../../utils';

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ROLE_EDIT,
                PermissionName.USER_ROLE_ADD,
                PermissionName.USER_ROLE_EDIT,
                PermissionName.USER_ROLE_DROP,
            ],
        });

        const items = [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
            {
                name: 'Permissions', icon: 'fas fa-user-secret', urlSuffix: 'permissions',
            },
            {
                name: 'Users', icon: 'fas fa-users', urlSuffix: 'users',
            },
        ];

        const toast = useToast();

        const route = useRoute();

        const entity : Ref<Role> = ref(null) as any;

        try {
            entity.value = await useAuthupAPI()
                .role
                .getOne(route.params.id as string);
        } catch (e) {
            await navigateTo({ path: '/admin/roles' });
            throw createError({});
        }

        const store = useAuthStore();
        const { realmManagement } = storeToRefs(store);

        if (!isRealmResourceWritable(realmManagement.value, entity.value.realm_id)) {
            await navigateTo({ path: '/admin/roles' });
            throw createError({});
        }

        const handleUpdated = (e: Role) => {
            toast.show({ variant: 'success', body: 'The role was successfully updated.' });

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'success', body: e.message });
        };

        return {
            entity,
            items,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa-solid fa-theater-masks me-1" /> {{ entity.name }}
            <span class="sub-title ms-1">Details</span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :path="'/admin/roles/'+entity.id"
                :items="items"
                :prev-link="true"
            />
        </div>
        <div>
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
