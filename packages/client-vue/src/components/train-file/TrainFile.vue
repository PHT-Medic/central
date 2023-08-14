<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    DomainType,
} from '@personalhealthtrain/central-common';
import type {
    TrainFile,
} from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<TrainFile>,
            required: true,
        },
        filesSelected: {
            type: Array,
            required: true,
        },
        fileSelectedId: {
            type: String,
        },
    },
    emits: {
        ...defineEntityManagerEvents<TrainFile>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        toggle: (_entity?: TrainFile) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        check: (_entity?: TrainFile) => true,
    },
    setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.TRAIN_FILE}`,
            props,
            setup,
        });

        const busy = ref(false);

        const path = computed(() => `${manager.data.value.directory}/${manager.data.value.name}`);

        const marked = computed(() => {
            if (!props.filesSelected) {
                return false;
            }

            return props.filesSelected.findIndex((file) => manager.data.value && file === manager.data.value.id) !== -1;
        });

        const isMatch = computed(() => manager.data.value && props.fileSelectedId === manager.data.value.id);

        const toggle = () => {
            setup.emit('toggle', manager.data.value);
        };

        const markToggle = () => {
            setup.emit('check', manager.data.value);
        };

        return {
            drop: manager.delete,
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
                <small class="text-muted ms-1">{{ entity.size }} Bytes</small>
            </span>
        </div>
        <div class="ms-auto d-flex flex-row me-1">
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
            <div class="ms-1">
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
