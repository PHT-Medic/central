<script>
export default {
    props: {
        items: Array
    },
    data() {
        return {
            showAll: false
        }
    },
    methods: {
        toggle() {
            this.showAll = !this.showAll;
        }
    }
}
</script>

<template>
    <ul class="list-unstyled card-option" :class="{'show-all': showAll}">
        <li class="main-card-option">
            <i class="fa" :class="{'fa-wrench': !showAll, 'fa-times': showAll}" @click.prevent="toggle"></i>
        </li>
        <li v-for="(value,key) in items" :key="key">
            <i :class="value.class"></i>
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
