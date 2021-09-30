<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getAPIUserKeyRing, Train} from "@personalhealthtrain/ui-common";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            public_key: {
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
            if(typeof this.user === 'undefined' || this.public_key.busy) return;

            this.public_key.busy = true;

            try {
                this.public_key = await getAPIUserKeyRing();
            } catch (e) {

            }

            this.public_key.busy = false;
            this.public_key.loaded = true;
        },

        setTrainType(type) {
            this.$emit('setTrainType', type);
        }
    }
}
</script>
<template>
    <div>
        <div v-if="!public_key" class="alert alert-danger m-b-20">
            A public key must be specified in the <nuxt-link :to="'/settings/security'"><i class="fa fa-cog"></i> settings</nuxt-link> section.
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
                        Start a <strong>discovery</strong> train, to know which data and params are available at all specified stations.
                    </b-card-text>
                </b-tab>
                <b-tab title="Analyse" :active="isAnalyseTrain" @click="setTrainType('analyse')">
                    <b-card-text>
                        Run a <strong>analyse</strong> train, to run your analyse according the achieved metadata achieved during the discovery phase.
                    </b-card-text>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>
