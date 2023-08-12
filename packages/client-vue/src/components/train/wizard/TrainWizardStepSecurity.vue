<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineComponent } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import TrainUserSecretPicker from '../TrainUserSecretPicker.vue';

export default defineComponent({
    components: {
        TrainUserSecretPicker,
    },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const handleUpdated = (item: Partial<Train>) => {
            emit('updated', item);
        };

        return {
            handleUpdated,
        };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="mb-2">
            <h6><i class="fa fa-key" /> Security</h6>

            <train-user-secret-picker
                :train-id="entity.id"
                :user-paillier-secret-id="entity.user_paillier_secret_id"
                :user-rsa-secret-id="entity.user_rsa_secret_id"
                @updated="handleUpdated"
            />
        </div>
    </div>
</template>
