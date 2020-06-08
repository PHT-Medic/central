<script>
    export default {
        props: {
            message: Object
        }
    }
</script>

<template>
    <div>
        <div
            v-if="message"
            :class="{'alert-warning': message.isError, 'alert-primary': !message.isError}"
            class="alert alert-sm">
            {{message.data}}
        </div>
    </div>
</template>
