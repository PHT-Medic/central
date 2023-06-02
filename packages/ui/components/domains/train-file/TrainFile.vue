<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainEventName } from '@authup/core';
import {
    DomainEventSubscriptionName,
    DomainType, buildDomainEventFullName, buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type {
    SocketServerToClientEventContext,
    TrainFile,
    TrainFileEventContext,
} from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import {
    computed, defineComponent, onMounted, onUnmounted, ref, toRefs,
} from 'vue';
import { useAPI } from '../../../composables/api';
import { useSocket } from '../../../composables/socket';

export default defineComponent({
    props: {
        file: {
            type: Object as PropType<TrainFile>,
            required: true,
        },
        filesSelected: {
            type: Array,
            default: () => [],
        },
        fileSelectedId: {
            type: String,
        },
    },
    emits: ['toggle', 'check', 'updated', 'deleted'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);

        const path = computed(() => `${refs.file.value.directory}/${refs.file.value.name}`);

        const marked = computed(() => {
            if (!refs.filesSelected.value) {
                return false;
            }

            return refs.filesSelected.value.findIndex((file) => file === refs.file.value.id) !== -1;
        });

        const isMatch = computed(() => this.fileSelectedId === refs.file.value.id);

        const toggle = () => {
            emit('toggle', refs.file);
        };

        const markToggle = () => {
            emit('check', refs.file);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<TrainFileEventContext>) => {
            if (
                refs.file.value.id !== context.data.id ||
                context.meta.roomId !== refs.file.value.id
            ) return;

            emit('updated', context.data);
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainFileEventContext>) => {
            if (
                refs.file.value.id !== context.data.id ||
                context.meta.roomId !== refs.file.value.id
            ) return;

            emit('deleted', context.data);
        };

        const socket = useSocket().useRealmWorkspace(refs.file.value.realm_id);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_FILE,
                DomainEventSubscriptionName.SUBSCRIBE,
            ), refs.file.value.id);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_FILE,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ), refs.file.value.id);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        const drop = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const file = await useAPI().trainFile.delete(this.file.id);
                emit('deleted', file);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        return {
            drop,
            marked,
            markToggle,
            path,
            isMatch,
            toggle,
            busy,
        };
    },
});
</script>
<template>
    <div
        class="card card-file d-flex flex-row align-items-center p-1"
        :class="{'checked': marked}"
    >
        <div
            class="card-heading align-items-center d-flex flex-row"
            @click.prevent="markToggle"
        >
            <span class="title">
                {{ path }}
                <small class="text-muted ml-1">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ml-auto d-flex flex-row mr-1">
            <div>
                <button
                    v-if="!fileSelectedId || isMatch"
                    type="button"
                    class="btn btn-xs"
                    :class="{
                        'btn-success': !isMatch,
                        'btn-warning': isMatch
                    }"
                    @click.prevent="toggle"
                >
                    <i
                        :class="{
                            'fa fa-check': !isMatch,
                            'fa fa-times': isMatch
                        }"
                    />
                </button>
            </div>
            <div class="ml-1">
                <button
                    type="button"
                    class="btn btn-danger btn-xs"
                    :disabled="busy"
                    @click.prevent="drop"
                >
                    <i class="fa fa-trash" />
                </button>
            </div>
        </div>
    </div>
</template>
