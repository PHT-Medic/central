<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry } from '@personalhealthtrain/core';
import { Ecosystem } from '@personalhealthtrain/core';
import { useToast } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { RegistryCleanup, RegistrySetup } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    components: { RegistryCleanup, RegistrySetup },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    async setup(props) {
        const toast = useToast();

        if (props.entity.ecosystem !== Ecosystem.DEFAULT) {
            await navigateTo(`/admin/services/registry/${props.entity.id}`);
        }

        const handleExecuted = () => {
            if (toast) {
                toast.success({ body: 'You successfully executed the setup routine.' }, {
                    pos: 'top-center',
                });
            }
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.danger({ body: e.message }, {
                    pos: 'top-center',
                });
            }
        };

        return {
            handleFailed,
            handleExecuted,
        };
    },
});
</script>
<template>
    <div>
        <RegistrySetup
            :entity-id="entity.id"
            @executed="handleExecuted"
            @failed="handleFailed"
        />
    </div>
</template>
