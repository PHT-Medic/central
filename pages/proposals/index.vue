<script>
    import {dropProposal, getApiProposals} from "@/domains/proposal/api.ts";
    import {LayoutNavigationDefaultId} from "@/config/layout.ts";

    export default {
        meta: {
            navigationId: LayoutNavigationDefaultId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add', 'proposal') || can('edit', 'proposal') || can('drop','proposal') ||
                    can('add', 'train') || can('drop', 'train') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        },
        async asyncData (context) {
            try {
                const items = await getApiProposals();

                return {
                    items
                };
            } catch (e) {
                await context.redirect('/');
            }
        },
        data () {
            return {
                isBusy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'title', label: 'Titel', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: []
            }
        },
        methods: {
            async dropProposal (index) {
                const proposal = this.items[index];
                const confirmed = confirm('Den Antrag ' + proposal.title + ' (ID: ' + proposal.id + ') zurückziehen?');
                if (confirmed) {
                    try {
                        await dropProposal(proposal.id);
                        this.items.splice(index, 1);
                    } catch (e) {

                    }
                }
            },

            canGoToTrainView() {
                return this.$auth.can('add','train') || this.$auth.can('edit','train') || this.$auth.can('drop','train') ||
                    this.$auth.can('read', 'trainResult') || this.$auth.can('start', 'trainExecution') || this.$auth.can('stop','trainExecution')
            },
            canEdit() {
                return this.$auth.can('edit','proposal');
            },
            canDrop() {
                return this.$auth.can('drop','proposal');
            }
        }
    }
</script>
<template>
    <div class="container">
        <div class="m-b-10">
            <h4 class="title">
                Ausgehende Anträge
            </h4>
        </div>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary alert-sm">
                    In dieser Übersicht werden alle Anträge, die von Ihnen oder einer Person Ihrer Station/Realm beantragt wurde, angezeigt.
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(created_at)="data">
                            <timeago :datetime="data.item.createdAt" />
                        </template>
                        <template v-slot:cell(updated_at)="data">
                            <timeago :datetime="data.item.updatedAt" />
                        </template>

                        <template v-slot:cell(options)="data">
                            <nuxt-link v-if="canEdit" :to="'/proposals/' + data.item.id " title="Ansicht" class="btn btn-outline-primary btn-xs">
                                <i class="fa fa-bars" />
                            </nuxt-link>
                            <nuxt-link v-if="canGoToTrainView" :to="'/proposals/' + data.item.id + '/trains'" title="Zug Verwaltung" class="btn btn-outline-dark btn-xs">
                                <i class="fa fa-train" />
                            </nuxt-link>
                            <a v-if="canDrop" class="btn btn-outline-danger btn-xs" title="Löschen" @click="dropProposal(data.index)">
                                <i class="fas fa-trash-alt" /></a>
                        </template>

                        <template v-slot:table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </b-table>
                    <div class="alert alert-warning alert-sm" v-if="!isBusy && items.length === 0">
                        Es sind keine Anträge vorhanden...
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
