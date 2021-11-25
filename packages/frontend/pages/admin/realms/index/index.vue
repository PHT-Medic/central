<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID, dropAPIRealm } from '@personalhealthtrain/ui-common';
import RealmList from '../../../../components/domains/realm/RealmList';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    components: { RealmList },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_ADD,
            PermissionID.REALM_EDIT,
            PermissionID.REALM_DROP,
        ],
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                {
                    key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
            items: [],
        };
    },
    methods: {
        async drop(item) {
            const l = this.$createElement;

            await this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0' }, [
                l('p', null, [
                    'Are you sure that you want to delete the realm  ',
                    l('b', null, [item.name]),
                    '?',
                ]),
            ]), {
                size: 'sm',
                buttonSize: 'xs',
                cancelTitle: 'Abbrechen',
            })
                .then((value) => {
                    if (value) {
                        return dropAPIRealm(item.id)
                            .then(() => {
                                this.$refs['items-list'].dropArrayItem(item);
                                return value;
                            });
                    }

                    return value;
                }).catch((e) => {
                    throw e;
                });
        },
    },
};
</script>
<template>
    <realm-list ref="items-list">
        <template #header-title>
            This is a slight overview of all realms.
        </template>
        <template #header-actions="props">
            <div class="d-flex flex-row">
                <div>
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="props.busy"
                        @click.prevent="props.load"
                    >
                        <i class="fas fa-sync" /> Refresh
                    </button>
                </div>
            </div>
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
                        v-if="$auth.can('edit','realm')"
                        :to="'/admin/realms/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                        @click.prevent="edit(data.item.id)"
                    >
                        <i class="fa fa-arrow-right" />
                    </nuxt-link>
                    <button
                        v-if="$auth.can('drop','realm') && data.item.drop_able"
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
    </realm-list>
</template>
