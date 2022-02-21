<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { ServiceID } from '@personalhealthtrain/central-common';
import RobotForm from '../../../../components/domains/auth/robot/RobotForm';

export default {
    components: { RobotForm },
    props: {
        serviceId: ServiceID,
    },
    data() {
        return {

        };
    },
    methods: {
    },
};
</script>
<template>
    <robot-form
        :name-property="serviceId"
    />
</template>
