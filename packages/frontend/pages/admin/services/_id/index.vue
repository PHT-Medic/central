<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import HarborManagement from "../../../../components/domains/service/harbor/HarborManagement";
import {SERVICE_ID} from "@personalhealthtrain/ui-common";

export default {
    props: {
        serviceId: SERVICE_ID
    },
    render(createElement) {
        let template;

        switch (this.serviceId) {
            case SERVICE_ID.REGISTRY:
                template = HarborManagement;
                break;
        }

        if(typeof template === 'undefined') {
            return createElement('div', {
                class: 'alert alert-info alert-sm'
            }, `You can not execute any task for the ${this.serviceId} service yet.`);
        } else {
            return createElement(template, {
                props: { serviceId: this.serviceId},
                on: {
                    updated: (event) => this.$emit('updated', event)
                }
            });
        }
    }
}
</script>
