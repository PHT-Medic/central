import Vue from 'vue'
import {createTimeago} from 'vue-timeago';

const Component = createTimeago({
    locale: 'en'
});

const $timeago = {
    locale: 'en'
};

Vue.prototype.$timeago = Vue.observable ? Vue.observable($timeago) : new Vue({
    data: $timeago
});

Vue.component('timeago', Component);
