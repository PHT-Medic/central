<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';

export default {
    props: {
        entityProperty: Object,
    },
    data() {
        return {
            busy: false,

            extendView: false,

            socketLockId: null,
        };
    },
    computed: {
        canDrop() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_DROP);
        },
        userName() {
            return this.entityProperty.user ?
                this.entityProperty.user.display_name :
                this.entityProperty.user_id;
        },
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.entityProperty.realm_id);
        socket.emit('proposalsSubscribe', { data: { id: this.entityProperty.id } });

        socket.on('proposalUpdated', this.handleSocketUpdated);
        socket.on('proposalDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.entityProperty.realm_id);
        socket.emit('proposalsUnsubscribe', { data: { id: this.entityProperty.id } });
        socket.off('proposalUpdated', this.handleSocketUpdated);
        socket.off('proposalDeleted', this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.entityProperty.id !== context.data.id ||
                this.socketLockId === context.data.id ||
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
        handleUpdated(entity) {
            this.$emit('updated', entity);
        },
        handleDeleted(entity) {
            this.$emit('deleted', entity);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },

        async edit(item) {
            if (this.busy) return;

            this.busy = true;

            try {
                this.socketLockId = this.entityProperty.id;
                const response = await this.$api.proposal.update(this.entityProperty.id, item);
                this.socketLockId = null;

                this.handleUpdated(response);
            } catch (e) {
                this.handleFailed(e);
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy) return;

            this.busy = true;

            this.socketLockId = this.entityProperty.id;

            const l = this.$createElement;

            await this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-dark m-b-0' }, [
                l('p', null, [
                    'Are you sure that you want to delete the proposal  ',
                    l('b', null, [this.entityProperty.title]),
                    '?',
                ]),
            ]), {
                size: 'md',
                buttonSize: 'xs',
            })
                .then((value) => {
                    if (value) {
                        return this.$api.proposal.delete(this.entityProperty.id)
                            .then(() => {
                                this.socketLockId = null;

                                this.$emit('deleted', this.entityProperty);
                                return value;
                            });
                    }

                    this.busy = false;

                    return value;
                }).catch((e) => {
                    this.busy = false;
                    this.$emit('failed', e);
                });
        },
    },
};
</script>
<template>
    <div
        class="card card-grey p-1"
    >
        <slot
            name="item"
            :busy="busy"
            :drop="drop"
            :item="entityProperty"
        >
            <div class="d-flex flex-row align-items-center">
                <div class="h6 mb-0 pr-1">
                    📜
                </div>
                <div>
                    <slot name="item-name">
                        <nuxt-link
                            :to="'/proposals/'+entityProperty.id"
                            class="mb-0"
                        >
                            {{ entityProperty.title }} <small class="text-success ml-1">🚊{{ entityProperty.trains }}</small>
                        </nuxt-link>
                    </slot>
                </div>

                <div class="ml-auto">
                    <slot
                        name="item-actions"
                        :item="entityProperty"
                    >
                        <div class="d-flex flex-row">
                            <div>
                                <nuxt-link
                                    :to="'/proposals/'+entityProperty.id"
                                    type="button"
                                    class="btn btn-xs btn-dark"
                                    :disabled="busy"
                                >
                                    <i class="fa fa-bars" />
                                </nuxt-link>
                                <button
                                    type="button"
                                    class="btn btn-xs btn-danger"
                                    :disabled="busy || entityProperty.trains > 0"
                                    @click.prevent="drop()"
                                >
                                    <i class="fas fa-trash" />
                                </button>
                            </div>
                            <slot
                                name="item-actions-extra"
                                :busy="busy"
                                :item-busy="busy"
                                :item="entityProperty"
                            />
                        </div>
                    </slot>
                </div>
            </div>
            <div class="d-flex flex-row">
                <div>
                    <small><span class="text-muted">updated</span> <timeago :datetime="entityProperty.updated_at" /></small>
                </div>
                <div class="ml-auto">
                    <small><span class="text-muted">created by </span><span>{{ userName }}</span></small>
                </div>
            </div>
        </slot>
    </div>
</template>
