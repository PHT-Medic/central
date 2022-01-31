<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import TrainUserSecretPicker from '../TrainUserSecretPicker';

export default {
    components: {
        TrainUserSecretPicker,
    },
    props: {
        train: {
            type: Object,
            default: undefined,
        },
    },
    methods: {
        handleUpdated(item) {
            this.$emit('updated', item);
        },
    },
};
</script>
<template>
    <div>
        <div class="mb-2">
            <h6><i class="fa fa-key" /> Security</h6>

            <train-user-secret-picker
                :train-id="train.id"
                :user-paillier-secret-id="train.user_paillier_secret_id"
                :user-rsa-secret-id="train.user_rsa_secret_id"
                @updated="handleUpdated"
            />
        </div>
    </div>
</template>
