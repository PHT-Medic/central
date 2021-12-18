<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>
export default {
    props: {
        id: {
            type: Number,
            default: undefined,
        },
        ids: Array,
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isSelected() {
            return Array.isArray(this.ids) ?
                this.ids.indexOf(this.id) !== -1 : false;
        },
    },
    methods: {
        toggle() {
            this.$emit('toggle', this.id);
        },
    },
};
</script>
<template>
    <button
        :disabled="disabled"
        type="button"
        class="btn btn-xs"
        :class="{
            'btn-dark': !isSelected,
            'btn-warning': isSelected
        }"
        @click.prevent="toggle()"
    >
        <i
            :class="{
                'fa fa-plus': !isSelected,
                'fa fa-minus': isSelected
            }"
        />
    </button>
</template>
