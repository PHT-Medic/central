<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserSecretForm from '../../../components/domains/user-secret/UserSecretForm';
import UserSecretList from '../../../components/domains/user-secret/UserSecretList';

export default {
    components: { UserSecretList, UserSecretForm },
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
            this.$refs.itemsList.addArrayItem(item, true);
        },
        handleUpdated(item) {
            this.$refs.itemsList.editArrayItem(item);
        },
        handleDeleted(item) {
            if (item.id === this.itemId) {
                this.triggerEdit(this.item);
            }
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
                <template #item-actions-extra="props">
                    <div class="ml-1">
                        <button
                            type="button"
                            class="btn btn-xs"
                            :class="{'btn-primary': itemId !== props.item.id, 'btn-dark': itemId === props.item.id}"
                            @click.prevent="triggerEdit(props.item)"
                        >
                            <i class="fas"
                               :class="{'fas fa-pen-alt': itemId !== props.item.id, 'fa fa-eject': itemId === props.item.id}"
                            />
                        </button>
                    </div>
                </template>
            </user-secret-list>
        </div>
    </div>
</template>
