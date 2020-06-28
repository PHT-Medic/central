import Vue from 'vue'
import VueSocketIo from 'vue-socket.io';

export default ({ env }) => {
    Vue.use(new VueSocketIo({
        debug: true,
        connection: env.resourceApiUrl
    }));
};
