<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        file: {
            type: Object as PropType<File>,
            required: true,
        },
        pathSelected: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['drop'],
    setup(props, { emit }) {
        const path = computed(() => {
            let filename = props.file.name;
            if (props.file.webkitRelativePath) {
                filename = props.file.webkitRelativePath;
            }
            return filename;
        });

        const drop = () => {
            emit('drop', props.file);
        };

        return {
            path,
            drop,
        };
    },
});
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center p-1">
        <div class="card-heading">
            <span class="title">
                {{ path }}
                <small class="text-muted ms-1">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ms-auto">
            <button
                type="button"
                class="btn btn-dark btn-xs"
                @click.prevent="drop"
            >
                <i class="fa fa fa-trash" />
            </button>
        </div>
    </div>
</template>
