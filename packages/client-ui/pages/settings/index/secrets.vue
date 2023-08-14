<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { UserSecret } from '@personalhealthtrain/core';
import {
    SecretStorageAPICommand, buildUserSecretsSecretStorageKey,
} from '@personalhealthtrain/core';
import { useToast } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed, nextTick, ref } from 'vue';
import type { Ref } from 'vue';
import { EntityDelete, UserSecretForm, UserSecretList } from '@personalhealthtrain/client-vue';
import { useAPI } from '#imports';
import { defineNuxtComponent } from '#app';
import { wrapFnWithBusyState } from '../../../core';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: { EntityDelete, UserSecretList, UserSecretForm },
    setup() {
        const toast = useToast();

        const store = useAuthStore();
        const { userId } = storeToRefs(store);

        const entity : Ref<UserSecret | null> = ref(null);
        const entityId = computed(() => (entity.value ? entity.value.id : undefined));

        const query = computed<BuildInput<UserSecret>>(() => ({
            filter: { user_id: userId.value }, sort: { created_at: 'DESC' },
        }));

        const formNode = ref<null | typeof UserSecretForm>(null);

        const triggerEdit = (item: UserSecret) => {
            if (!entity.value || entity.value.id !== item.id) {
                entity.value = item;
            } else {
                entity.value = null;
            }

            nextTick(() => {
                if (formNode.value) {
                    formNode.value.resetFormData();
                }
            });
        };

        const listNode = ref<null | typeof UserSecretList>(null);
        const handleCreated = (item: UserSecret) => {
            if (listNode.value) {
                listNode.value.handleCreated(item);
            }

            if (toast) {
                toast.success({ body: 'The secret was successfully created.' });
            }
        };

        const handleUpdated = (item: UserSecret) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }

            if (toast) {
                toast.success({ body: 'The secret was successfully updated.' });
            }
        };

        const handleDeleted = (item: UserSecret) => {
            if (entity.value && item.id === entity.value.id) {
                triggerEdit(entity.value as UserSecret);
            }

            if (toast) {
                toast.success({ body: 'The secret was successfully deleted.' });
            }
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.warning({ body: e.message });
            }
        };

        return {
            userId,
            handleFailed,
            handleUpdated,
            handleCreated,
            handleDeleted,
            query,
            listNode,
            formNode,
            triggerEdit,
            entityId,
            entity,
        };
    },
});
</script>
<template>
    <div class="row">
        <div class="col-4">
            <h6><i class="fa-solid fa-file-lines pe-1" /> Form</h6>
            <user-secret-form
                ref="formNode"
                :user-id="userId"
                :entity="entity"
                @failed="handleFailed"
                @updated="handleUpdated"
                @created="handleCreated"
            />
        </div>
        <div class="col-8">
            <user-secret-list
                ref="listNode"
                :query="query"
                @deleted="handleDeleted"
            >
                <template #headerTitle>
                    <h6><i class="fa-solid fa-list pe-1" /> Overview</h6>
                </template>
                <template #itemActions="props">
                    <div class="me-1">
                        <button
                            type="button"
                            class="btn btn-xs me-1"
                            :class="{'btn-primary': entityId !== props.data.id, 'btn-dark': entityId === props.data.id}"
                            @click.prevent="triggerEdit(props.data)"
                        >
                            <i
                                class="fas"
                                :class="{'fas fa-pen-alt': entityId !== props.data.id, 'fa fa-eject': entityId === props.data.id}"
                            />
                        </button>
                        <entity-delete
                            :with-text="false"
                            class="btn btn-xs btn-danger"
                            :entity-id="props.data.id"
                            :entity-type="'userSecret'"
                            @deleted="props.deleted"
                        />
                    </div>
                </template>
            </user-secret-list>
        </div>
    </div>
</template>
