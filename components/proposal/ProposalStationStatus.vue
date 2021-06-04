<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>
export default {
    props: {
        status: {
            type: String,
            default: 'open'
        }
    },
    computed: {
        statusText() {
            return this.status;
        },
        classSuffix() {
            switch (this.status) {
                case 'approved':
                    return 'success';
                case 'rejected':
                    return 'danger';
                default:
                    return 'info';
            }
        }
    }
}
</script>
