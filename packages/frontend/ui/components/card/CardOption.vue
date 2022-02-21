<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        items: Array,
    },
    data() {
        return {
            showAll: false,
        };
    },
    methods: {
        toggle() {
            this.showAll = !this.showAll;
        },
    },
};
</script>

<template>
    <ul
        class="list-unstyled card-option"
        :class="{'show-all': showAll}"
    >
        <li class="main-card-option">
            <i
                class="fa"
                :class="{'fa-wrench': !showAll, 'fa-times': showAll}"
                @click.prevent="toggle"
            />
        </li>
        <li
            v-for="(value,key) in items"
            :key="key"
        >
            <i :class="value.class" />
        </li>
    </ul>
</template>
<style>
.card-option {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 20px;
    overflow: hidden;
    -webkit-transition: 0.3s ease-in-out;
    transition: 0.3s ease-in-out;
}

.card-option:not(.show-all) li:not(.main-card-option) {
    display: none;
}
</style>
