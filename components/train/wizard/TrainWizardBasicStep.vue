<script>
import {getUserPublicKey} from "@/domains/user/publicKey/api.ts";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            publicKey: {
                item: undefined,
                busy: false,
                loaded: false
            }
        }
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
        isDiscoveryTrain() {
            return this.train.type === 'discovery';
        },
        isAnalyseTrain() {
            return this.train.type === 'analyse';
        },
        trainExists() {
            return this.train.hasOwnProperty('id');
        }
    },
    created() {
        this.loadPublicKey();
    },
    methods: {
        async loadPublicKey() {
            if(typeof this.user === 'undefined' || this.publicKey.busy) return;

            this.publicKey.busy = true;

            try {
                this.publicKey = await getUserPublicKey();
            } catch (e) {

            }

            this.publicKey.busy = false;
            this.publicKey.loaded = true;
        },

        setTrainType(type) {
            this.$emit('setTrainType', type);
        }
    }
}
</script>
<template>
    <div>
        <div v-if="!publicKey" class="alert alert-danger m-b-20">
            Es muss ein PublicKey in den <nuxt-link :to="'/settings/security'"><i class="fa fa-cog"></i> Einstellungen</nuxt-link> hochgeladen werden.
        </div>

        <div class="alert alert-sm" :class="{'alert-info': !train.type, 'alert-warning': train.type}">
            <template v-if="train.type">
                Please be aware that you can't change the train type after you finished the configurator.
            </template>
            <template v-else>
                Please select the type for your train.
            </template>
        </div>

        <b-card no-body class="m-b-20">
            <b-tabs pills card vertical>
                <b-tab title="Discovery" :active="isDiscoveryTrain" @click="setTrainType('discovery')">
                    <b-card-text>
                        Starte einen Discovery Zug, um zu erfahren wie viele Daten augrund der angefoderten Parameter in den Krankenhäuser verfügbar sind.
                    </b-card-text>
                </b-tab>
                <b-tab title="Analyse" :active="isAnalyseTrain" @click="setTrainType('analyse')">
                    <b-card-text>
                        Starte einen Analyse auf Basis der zugrunde liegenden Ergebnisse des Discovery Zuges.
                    </b-card-text>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>
