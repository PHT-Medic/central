<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    SecretStorageCommand, buildUserSecretsSecretStorageKey,
} from '@personalhealthtrain/central-common';
import UserSecretForm from '../../../components/domains/user-secret/UserSecretForm';
import { UserSecretList } from '../../../components/domains/user-secret/UserSecretList';
import EntityDelete from '../../../components/domains/EntityDelete';

export default {
    components: { EntityDelete, UserSecretList, UserSecretForm },
    data() {
        return {
            item: undefined,
            busy: false,
        };
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
        itemId() {
            return this.item ? this.item.id : undefined;
        },
    },
    methods: {
        handleCreated(item) {
            this.$refs.itemsList.handleCreated(item);

            this.$bvToast.toast('The secret was successfully created.', {
                variant: 'success',
                toaster: 'b-toaster-top-center',
            });
        },
        handleUpdated(item) {
            this.$refs.itemsList.handleUpdated(item);

            this.$bvToast.toast('The secret was successfully updated.', {
                variant: 'info',
                toaster: 'b-toaster-top-center',
            });
        },
        handleDeleted(item) {
            if (item.id === this.itemId) {
                this.triggerEdit(this.item);
            }

            this.$bvToast.toast('The secret was successfully deleted.', {
                variant: 'danger',
                toaster: 'b-toaster-top-center',
            });
        },

        triggerEdit(item) {
            if (!this.item || this.item.id !== item.id) {
                this.item = item;
            } else {
                this.item = undefined;
            }

            this.$nextTick(() => {
                this.$refs.itemForm.resetFormData();
            });
        },
        async triggerSync() {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runSecretStorageCommand(
                    SecretStorageCommand.ENGINE_KEY_SAVE,
                    {
                        name: buildUserSecretsSecretStorageKey(this.$store.getters['auth/userId']),
                    },
                );

                this.$bvToast.toast('The secret was successfully synced.', {
                    variant: 'success',
                    toaster: 'b-toaster-top-center',
                });
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div class="row">
        <div class="col-4">
            <user-secret-form
                ref="itemForm"
                :user-id="user.id"
                :entity-property="item"
                @updated="handleUpdated"
                @created="handleCreated"
            />
        </div>
        <div class="col-8">
            <user-secret-list
                ref="itemsList"
                :query="{filters: {user_id: user.id}, sort: {created_at: 'DESC'}}"
                @deleted="handleDeleted"
            >
                <template #item-actions="props">
                    <div class="ml-1">
                        <entity-delete
                            :with-text="false"
                            class="btn btn-xs btn-danger"
                            :entity-id="props.item.id"
                            :entity-type="'userSecret'"
                            @done="props.handleDeleted"
                        />
                        <button
                            type="button"
                            class="btn btn-xs btn-primary"
                            @click.prevent="triggerSync(props.item)"
                        >
                            <i class="fas fa-sync" />
                        </button>
                        <button
                            type="button"
                            class="btn btn-xs"
                            :class="{'btn-primary': itemId !== props.item.id, 'btn-dark': itemId === props.item.id}"
                            @click.prevent="triggerEdit(props.item)"
                        >
                            <i
                                class="fas"
                                :class="{'fas fa-pen-alt': itemId !== props.item.id, 'fa fa-eject': itemId === props.item.id}"
                            />
                        </button>
                    </div>
                </template>
            </user-secret-list>
        </div>
    </div>
</template>
