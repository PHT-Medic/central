<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import RobotForm from '../../../../components/domains/auth/robot/RobotForm';

export default {
    components: {
        RobotForm,
    },
    props: {
        entityProperty: {
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
    },
};
</script>
<template>
    <div>
        <robot-form
            :entity-property="entityProperty"
            @updated="handleUpdated"
            @deleted="handleDeleted"
        />
    </div>
</template>
