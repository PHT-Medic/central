<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserList from '../../../../../components/domains/auth/user/UserList';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout/contants';

export default {
    components: { UserList },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    props: {
        realm: Object,
    },
    data() {
        return {
            query: {
                filters: {
                    realm_id: this.realm.id,
                },
            },
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
        };
    },
    methods: {
        async drop(user) {
            const l = this.$createElement;

            try {
                const proceed = await this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0' }, [
                    l('p', null, [
                        'Are you sure, that you want to delete the user ',
                        l('b', null, [user.name]),
                        '?',
                    ]),
                ]), {
                    size: 'sm',
                    buttonSize: 'xs',
                });

                if (proceed) {
                    try {
                        await this.$authApi.user.delete(user.id);
                        this.$refs.itemsList.dropArrayItem(user);
                    } catch (e) {
                        // ...
                    }
                }
            } catch (e) {
                // ...
            }
        },
    },
};
</script>
<template>
    <user-list
        ref="itemsList"
        :query="query"
        :load-on-init="true"
    >
        <template #header-title>
            This is a slight overview of all users.
        </template>
        <template #items="props">
            <b-table
                :items="props.items"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(options)="data">
                    <nuxt-link
                        v-if="$auth.can('edit','user') || $auth.can('edit','user_permissions') || $auth.can('drop','user_permissions')"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/users/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <button
                        v-if="$auth.can('drop','user')"
                        type="button"
                        class="btn btn-xs btn-outline-danger"
                        title="Löschen"
                        @click.prevent="drop(data.item)"
                    >
                        <i class="fa fa-times" />
                    </button>
                </template>
                <template #cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>
                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </template>
    </user-list>
</template>
