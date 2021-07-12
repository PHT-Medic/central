<script>
import ServiceHarborTask from "~/components/service/task/ServiceHarborTask"

export default {
    props: {
        service: Object
    },
    render(createElement) {
        let template;

        switch (this.service.id) {
            case 'HARBOR':
                template = ServiceHarborTask;
                break;
        }

        if(typeof template === 'undefined') {
            return createElement('div', {
                class: 'alert alert-info alert-sm'
            }, `You can not execute any task for the ${this.service.id} service.`);
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
