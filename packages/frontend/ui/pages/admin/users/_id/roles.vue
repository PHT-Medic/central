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
    data() {
        return {
            role: {
                items: [],
                busy: false,
            },
            q: '',
            showOnlyOwnedRoles: true,
        };
    },
};
</script>
<template>
    <div>
        <user-role-list :entity-id="entity.id" />
    </div>
</template>
