<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import HarborRepositoryManagement from "./HarborRepositoryManagement";

export default {
    components: {
        HarborRepositoryManagement

    },
    props: {
        service: Object
    }
}
</script>
<template>
    <div>
        <harbor-repository-management :service="service" class="mb-2" />
    </div>
</template>
