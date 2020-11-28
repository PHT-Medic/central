<script>
    import NotImplemented from "../../../../components/NotImplemented";

    export default {
        props: {
            userProperty: {
                type: Object
            }
        },
        components: {
            NotImplemented
        },
        data() {
            return {
                role: {
                    items: [],
                    busy: false
                },
                showOnlyOwnedRoles: true
            }
        },
        methods: {
            handleCreated(e) {

            },
            handleDeleted(e) {

            }
        }
    }
</script>
<template>
    <div>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="form-group">
                    <div class="input-group">
                        <label for="permission-q"></label>
                        <input v-model="q" type="text" name="q" id="permission-q" class="form-control" placeholder="Name..." autocomplete="new-password" />
                        <div class="input-group-append">
                            <span class="input-group-text"><i class="fa fa-search"></i></span>
                        </div>
                    </div>
                </div>

                <div class="form-group pl-1 mb-1">
                    <b-form-checkbox v-model="showOnlyOwnedRoles" :disabled="role.busy" switch>
                        Nur Rollen anzeigen
                    </b-form-checkbox>
                </div>

                <vue-scroll style="height:500px">
                    <b-list-group>
                        <user-role-list-item
                            @created="handleCreated"
                            @deleted="handleDeleted"
                            v-for="(role,key) in role.items"
                            :key="key"
                            :role="role"
                            :user="userProperty"
                            :is-owner-view="showOnlyOwnedRoles"
                        />
                        <div class="alert alert-sm alert-warning" v-if="role.items.length === 0 && !role.busy">
                            Der User hat keine Rollen...
                        </div>
                    </b-list-group>
                </vue-scroll>
            </div>
        </div>
    </div>
</template>
