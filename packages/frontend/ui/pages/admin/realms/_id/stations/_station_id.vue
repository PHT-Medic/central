<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue, { PropType } from 'vue';
import { Realm } from '@authelion/common';
import { Socket } from 'socket.io-client';
import {
    SocketClientToServerEvents,
    SocketServerToClientEventContext, SocketServerToClientEvents,
    Station, StationSocketClientToServerEventName, StationSocketServerToClientEventName,
} from '@personalhealthtrain/central-common';
import { ComponentListHandlerMethodOptions } from '@vue-layout/utils';
import { StationForm } from '../../../../../components/domains/station/StationForm';

// todo: add data, prop, method typing
export default Vue.extend<any, any, any, any>({
    components: { StationForm },
    props: {
        entity: {
            type: Object as PropType<Realm>,
            default: undefined,
        },
    },
    async asyncData(context) {
        try {
            const { data: stations } = await context.$api.station.getMany({
                filter: {
                    id: context.params.station_id,
                },
                fields: {
                    station: [
                        '+registry_id',
                        '+registry_project_id',
                        '+public_key',
                        '+email',
                    ],
                },
            });

            if (stations.length === 0) {
                await context.redirect(`/admin/realms/${context.params.id}/stations`);

                return {
                    childEntity: undefined,
                };
            }

            return {
                childEntity: stations[0],
            };
        } catch (e) {
            await context.redirect(`/admin/realms/${context.params.id}/stations`);

            return {
                childEntity: undefined,
            };
        }
    },
    data() {
        return {
            childEntity: undefined,
        };
    },
    created() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.id);

        if (this.childEntity) {
            socket.emit(StationSocketClientToServerEventName.SUBSCRIBE, { data: { id: this.childEntity.id } });
            socket.on(StationSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        }
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.id);

        if (this.childEntity) {
            socket.emit(StationSocketClientToServerEventName.UNSUBSCRIBE, { data: { id: this.childEntity.id } });
            socket.off(StationSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        }
    },
    methods: {
        handleSocketUpdated(context: SocketServerToClientEventContext<Station>) {
            if (
                this.childEntity.id !== context.data.id ||
                context.meta.roomId !== this.childEntity.id
            ) return;

            this.handleUpdated(context.data, { displayMessage: false });
        },
        handleUpdated(
            item: Station,
            options?: ComponentListHandlerMethodOptions<Station> & {displayMessage?: boolean},
        ) {
            options = options || {};
            options.displayMessage = options.displayMessage ?? true;

            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.childEntity, keys[i], item[keys[i]]);
            }

            if (options.displayMessage) {
                this.$bvToast.toast('The station was successfully updated.', {
                    toaster: 'b-toaster-top-center',
                    variant: 'success',
                });
            }
        },
        async handleDeleted() {
            this.$bvToast.toast('The station was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push(`/admin/realms/${this.enitty.id}/stations`);
        },
        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
});
</script>
<template>
    <station-form
        :entity="childEntity"
        :realm-id="entity.id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
