<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import HarborProjectManagement from "./HarborProjectManagement";
import {SERVICE_ID} from "@personalhealthtrain/ui-common";
export default {
    components: {
        HarborProjectManagement
    },
    props: {
        serviceId: SERVICE_ID
    }
}
</script>
<template>
    <div>
        <harbor-project-management :service-id="serviceId" class="mb-2" />
    </div>
</template>
