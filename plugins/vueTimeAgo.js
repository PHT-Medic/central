import Vue from 'vue'
import vueTimeago from 'vue-timeago';

Vue.use(vueTimeago, {
    name: 'Timeago', // Component name, `Timeago` by default
    locale: 'de', // Default locale
    // We use `date-fns` under the hood
    // So you can use all locales from it
    locales: {
        de: require('date-fns/locale/de')
    }
});
