<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        message: Object,
    },
};
</script>

<template>
    <div>
        <div
            v-if="message"
            :class="{'alert-warning': message.isError, 'alert-info': !message.isError}"
            class="alert alert-sm"
        >
            {{ message.data }}
        </div>
    </div>
</template>
