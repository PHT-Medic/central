<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import TrainPipeline from './TrainPipeline';
import TrainStationsProgress from '../train-station/progress/TrainStationsProgress';
import TrainName from './TrainName';

export default {
    components: {
        TrainName,
        TrainStationsProgress,
        TrainPipeline,
    },
    props: {
        entityProperty: Object,
    },
    data() {
        return {
            train: null,

            busy: false,

            extendView: false,

            socketLockId: null,
        };
    },
    computed: {
        canDrop() {
            return this.$auth.can('drop', 'train');
        },
        userName() {
            return typeof this.entityProperty.user === 'undefined' ? this.entityProperty.user_id : this.entityProperty.user.name;
        },
    },
    created() {
        this.train = this.entityProperty;
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.train.realm_id);
        socket.emit('trainsSubscribe', { data: { id: this.entityProperty.id } });

        socket.on('trainUpdated', this.handleSocketUpdated);
        socket.on('trainDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.train.realm_id);
        socket.emit('trainsUnsubscribe', { data: { id: this.entityProperty.id } });
        socket.off('trainUpdated', this.handleSocketUpdated);
        socket.off('trainDeleted', this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.entityProperty.id !== context.data.id ||
                context.meta.roomId !== this.entityProperty.id
            ) return;

            this.handleUpdated(context.data);
        },
        handleSocketDeleted(context) {
            if (
                this.entityProperty.id !== context.data.id ||
                this.socketLockId === context.data.id ||
                context.meta.roomId !== this.entityProperty.id
            ) return;

            this.handleDeleted({ ...context.data });
        },
        handleUpdated(train) {
            // eslint-disable-next-line no-restricted-syntax
            for (const key in train) {
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
                this.socketLockId = this.train.id;
                await this.$api.train.delete(this.train.id);
                this.socketLockId = null;

                this.$emit('deleted', this.train);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div class="train-card">
        <div
            class="train-card-content align-items-center"
        >
            <train-name
                :train-id="train.id"
                :train-name="train.name"
                :with-edit="true"
                @updated="handleUpdated"
            >
                <template #text="props">
                    🚊 <nuxt-link :to="'/trains/'+props.trainId">
                        {{ props.displayText }}
                    </nuxt-link>

                    <template v-if="props.trainName">
                        <small class="text-muted">{{ props.trainId }}</small>
                    </template>
                </template>
            </train-name>

            <div class="ml-auto">
                <button
                    class="btn btn-dark btn-xs"
                    @click.prevent="toggleExtendView"
                >
                    <i
                        class="fa"
                        :class="{
                            'fa-chevron-down': !extendView,
                            'fa-chevron-up': extendView
                        }"
                    />
                </button>
                <nuxt-link
                    class="btn btn-dark btn-xs"
                    type="button"
                    :to="'/trains/'+train.id"
                >
                    <i class="fa fa-bars" />
                </nuxt-link>
                <button
                    v-if="canDrop"
                    class="btn btn-danger btn-xs"
                    type="button"
                    @click.prevent="drop"
                >
                    <i class="fa fa-trash" />
                </button>
            </div>
        </div>

        <train-stations-progress
            v-if="extendView"
            :train="train"
        />

        <div>
            <hr>
        </div>

        <train-pipeline
            :entity="train"
            :with-command="extendView"
            @updated="handleUpdated"
            @failed="handleFailed"
            @deleted="handleDeleted"
        />

        <div class="train-card-footer">
            <div>
                <small><span class="text-muted">updated</span> <timeago :datetime="train.created_at" /></small>
            </div>
            <div class="ml-auto">
                <small><span class="text-muted">created by </span><span>{{ userName }}</span></small>
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

.train-card-content{
    min-height: 1.5rem;
}

.train-card-content input {
    height: 1.5rem;
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
