<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropAPIRealm, getAPIRealms, PermissionID} from "@personalhealthtrain/ui-common";
import RealmForm from "../../../../components/domains/admin/realm/RealmForm";
import RealmList from "../../../../components/domains/realm/RealmList";
import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";

export default {
    components: {RealmList, RealmForm},
    meta: {
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [
            PermissionID.REALM_ADD,
            PermissionID.REALM_EDIT,
            PermissionID.REALM_DROP
        ]
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: []
        }
    },
    methods: {
        async drop(item) {
            let l = this.$createElement;

            await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                l('p', null, [
                    'Are you sure that you want to delete the realm  ',
                    l('b', null, [item.name]),
                    '?'
                ])
            ]), {
                size: 'sm',
                buttonSize: 'xs',
                cancelTitle: 'Abbrechen'
            })
                .then(value => {
                    if(value) {
                        return dropAPIRealm(item.id)
                            .then(() => {
                                this.$refs['items-list'].dropArrayItem(item);
                                return value;
                            });
                    }

                    return value;
                }).catch(e => {
                    throw e;
                });
        }
    }
}
</script>
<template>
    <realm-list ref="items-list">
        <template v-slot:header-title>
            This is a slight overview of all realms.
        </template>
        <template v-slot:header-actions="props">
            <div class="d-flex flex-row">
                <div>
                    <button type="button" class="btn btn-xs btn-dark" :disabled="props.busy" @click.prevent="props.load">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>
        </template>
        <template v-slot:items="props">
            <b-table :items="props.items" :fields="fields" :busy="props.busy" head-variant="'dark'" outlined>
                <template v-slot:cell(options)="data">
                    <nuxt-link
                        :to="'/admin/realms/'+data.item.id"
                        v-if="$auth.can('edit','realm')"
                        @click.prevent="edit(data.item.id)"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-arrow-right"></i>
                    </nuxt-link>
                    <button
                        v-if="$auth.can('drop','realm') && data.item.drop_able"
                        @click.prevent="drop(data.item)"
                        type="button"
                        class="btn btn-xs btn-outline-danger"
                        title="Löschen"
                    >
                        <i class="fa fa-times"></i>
                    </button>
                </template>
                <template v-slot:cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </template>
    </realm-list>
</template>
