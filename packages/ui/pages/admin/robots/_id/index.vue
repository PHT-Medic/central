<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

export default {
    props: {
        entity: {
            type: Object,
            default: undefined,
        },
    },
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleDeleted(e) {
            this.$emit('deleted', e);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>
<template>
    <div>
        <robot-form
            :entity="entity"
            @updated="handleUpdated"
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
