<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import {getRoleUsers} from "@/domains/role/user/api.ts";
    import UserRoleListItem from "@/components/user/role/UserRoleListItem";
    import {getUsers} from "@/domains/user/api.ts";

    export default {
        props: {
            roleProperty: {
                type: Object
            }
        },
        components: {
            UserRoleListItem,
            NotImplemented
        },
        data() {
            return {
                q: '',
                onlyCrawlMembers: true,
                user: {
                    items: [],
                    busy: false
                }
            }
        },
        watch: {
            onlyCrawlMembers: function (val, oldVal){
                if(val !== oldVal) {
                    this.user.busy = false;
                    this.user.items = [];
                    this.load();
                }
            },
            q: function (val, oldVal) {
                if(val === oldVal) return;

                if(val.length === 1 && val.length > oldVal.length) {
                    return;
                }

                this.load();
            }
        },
        created() {
            this.load();
        },
        methods: {
            async load() {
                if(this.onlyCrawlMembers) {
                    await this.loadMembers();
                } else {
                    await this.loadUsers();
                }
            },
            async loadUsers() {
                if(this.user.busy) return;

                this.user.busy = true;

                try {
                    const options = {
                        filter: {
                            name: this.q
                        }
                    };

                    this.user.items = await getUsers(options);
                    this.user.busy = false;
                } catch (e) {
                    this.user.busy = false;
                }
            },
            async loadMembers() {
                if(this.user.busy) return;

                this.user.busy = true;

                try {
                    const options = {
                        filter: {
                            name: this.q
                        }
                    };

                    this.user.items = await getRoleUsers(this.roleProperty.id, 'related', options);
                    this.user.busy = false;
                } catch (e) {
                    this.user.busy = false;
                }
            },

            handleCreated(e) {

            },
            handleDeleted(e) {
                if(this.onlyCrawlMembers) {
                    let index = this.user.items.findIndex((user) => {
                        return user.id === e.id;
                    });

                    console.log(index);

                    if(index !== -1) {
                        this.user.items.splice(index, 1);
                    }
                }
            }
        }
    }
</script>
<template>
    <div>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-info alert-sm">
                    Hier kann zwischen der Ansicht der <strong>Mitglieder</strong> und <strong>allen Benutzer</strong> gewechselt werden.
                    Ebenfalls können neue Benutzer der Rolle {{roleProperty.name}} hinzugefügt oder alte entfernt werden...
                </div>
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
                    <b-form-checkbox v-model="onlyCrawlMembers" :disabled="user.busy" switch>
                        Nur Mitglieder anzeigen
                    </b-form-checkbox>
                </div>

                <hr />

                <vue-scroll style="height:500px">
                    <b-list-group>
                        <user-role-list-item
                            @created="handleCreated"
                            @deleted="handleDeleted"
                            v-for="(user,key) in user.items"
                            :key="key"
                            :role="roleProperty"
                            :user="user"
                            :is-owner-view="onlyCrawlMembers"
                        />
                        <div class="alert alert-sm alert-warning" v-if="user.items.length === 0 && !user.busy">
                            Die Gruppe hat keine Mitglieder...
                        </div>
                    </b-list-group>
                </vue-scroll>
            </div>
        </div>
    </div>
</template>
