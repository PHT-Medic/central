<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import TrainPipeline from "@/components/train/TrainPipeline";
import {dropTrain} from "@/domains/train/api";
import TrainStationsProgress from "@/components/train-station/progress/TrainStationsProgress";

export default {
    components: {
        TrainStationsProgress,
        TrainPipeline

    },
    props: {
        trainProperty: Object
    },
    created() {
        this.train = this.trainProperty;
    },
    data() {
        return {
            train: null,

            extendView: false
        }
    },
    computed: {
        canDrop() {
            return this.$auth.can('drop','train');
        }
    },
    methods: {
        handleDone(train) {
            for(let key in train) {
                Vue.set(this.train, key, train[key]);
            }

            this.$emit('done', train);
        },
        handleDeleted(train) {
            this.$emit('deleted', train);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },

        // ---------------------------------------------------------

        toggleExtendView() {
            this.extendView = !this.extendView;
        },

        // ---------------------------------------------------------

        async drop() {
            if (this.busy) return;

            this.busy = true;

            try {
                await dropTrain(this.train.id);

                this.$emit('deleted', this.train);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        }
    }
}
</script>
<template>
    <div class="train-card">
        <div class="train-card-content align-items-end">
            <div class="train-card-content">
                <div>
                    <strong class="m-b-0">
                        <nuxt-link :to="'/trains/'+train.id">{{train.id}}</nuxt-link>
                    </strong>
                </div>
            </div>
            <div class="ml-auto">
                <button
                    @click.prevent="toggleExtendView"
                    class="btn btn-dark btn-xs"
                >
                    <i class="fa" :class="{
                        'fa-chevron-down': !extendView,
                        'fa-chevron-up': extendView
                    }"></i>
                </button>
                <button v-if="canDrop" @click.prevent="drop" class="btn btn-danger btn-xs" type="button">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </div>

        <train-stations-progress
            v-if="extendView"
            :train="train"
        />

        <train-pipeline
            :train-property="train"
            :with-command="extendView"
            @done="handleDone"
            @failed="handleFailed"
            @deleted="handleDeleted"
            />

        <div class="train-card-footer">
            <div>
                <small><span class="text-muted">created by </span><span>{{train.user.name}}</span></small>
            </div>
            <div class="ml-auto">
                <small><span class="text-muted">updated</span> <timeago :datetime="train.createdAt" /></small>
            </div>
        </div>
    </div>
</template>
<style>
.train-card {
    background-color: #ececec;
    border: 1px solid #dedede;

    /* box-shadow: 0 4px 25px 0 rgba(0,0,0,.1); */
    transition: all .3s ease-in-out;

    border-radius: 4px;

    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
}

.train-card .train-card-content,
.train-card .train-card-footer {
    display: flex;
    flex-direction: row;
}

.train-card .train-card-icon {
    font-size: 1.5rem;
    padding-right: 0.5rem;
}
</style>
