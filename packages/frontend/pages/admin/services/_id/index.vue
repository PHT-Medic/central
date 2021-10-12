<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import HarborManagement from "../../../../components/service/harbor/HarborManagement";

export default {
    props: {
        service: Object
    },
    render(createElement) {
        let template;

        switch (this.service.id) {
            case 'HARBOR':
                template = HarborManagement;
                break;
        }

        if(typeof template === 'undefined') {
            return createElement('div', {
                class: 'alert alert-info alert-sm'
            }, `You can not execute any task for the ${this.service.id} service yet.`);
        } else {
            return createElement(template, {
                props: { service: this.service},
                on: {
                    updated: (event) => this.$emit('updated', event)
                }
            });
        }
    }
}
</script>
