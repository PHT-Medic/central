<script>
    import proposalService from '../../services/edge/proposal/proposalEdge';
    import momentHelper from "../../services/time/helpers/momentHelper";

    export default {
        meta: {
            requireLoggedIn: true
        },
        async asyncData (context) {
            try {
                const items = await proposalService.getOutProposals();

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
                        await proposalService.dropProposal(proposal.id);
                        this.items.splice(index, 1);
                    } catch (e) {

                    }
                }
            }
        },
        computed: {
            formattedItems() {
                return this.items.map((item) => {
                    item.created_at_formatted = momentHelper(item.createdAt, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    item.updated_at_formatted = momentHelper(item.updatedAt, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    return item;
                })
            }
        }
    }
</script>
<template>
    <div class="text-left">
        <div class="m-b-10">
            <h4 class="title">
                Anträge <span class="sub-title">Übersicht</span>
            </h4>
        </div>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Dies ist eine Übersicht von Anträgen, die Sie erstellt haben.
                </div>
                <div class="m-t-10">
                    <b-table :items="formattedItems" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(created_at)="data">
                            {{data.item.created_at_formatted}}
                        </template>
                        <template v-slot:cell(updated_at)="data">
                            {{data.item.updated_at_formatted}}
                        </template>

                        <template v-slot:cell(options)="data">
                            <nuxt-link :to="'/proposals/' + data.item.id " title="Ansicht" class="btn btn-outline-primary btn-xs">
                                <i class="fa fa-bars" />
                            </nuxt-link>
                            <nuxt-link :to="'/proposals/' + data.item.id + '/train'" title="Editieren" class="btn btn-outline-dark btn-xs">
                                <i class="fa fa-train" />
                            </nuxt-link>
                            <a class="btn btn-outline-danger btn-xs" title="Löschen" @click="dropProposal(data.index)">
                                <i class="fas fa-trash-alt" /></a>
                        </template>

                        <template v-slot:table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </b-table>
                </div>
            </div>
        </div>
    </div>
</template>
