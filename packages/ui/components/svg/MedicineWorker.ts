/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, toRefs } from 'vue';
import MedicineWorkerTemplate from './MedicineWorker.svg';

export default defineComponent({
    props: {
        width: {
            type: [Number, String],
            default: 750,
        },
        height: {
            type: [Number, String],
            default: 500,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        return () => h('img', {
            src: MedicineWorkerTemplate,
            width: refs.width.value,
            height: refs.height.value,
            style: {
                maxWidth: '100%',
            },
        });
    },
});
