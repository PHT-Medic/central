import Vuex from 'vuex';

import authModule from './auth';
import layoutModule from './layout';

const createStore = () => {
    return new Vuex.Store({
        namespaced: true,
        modules: {
            auth: authModule,
            layout: layoutModule
        }
    });
};

export default createStore;
