<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        train: {
            type: Object,
            default: undefined
        },
    },
    data() {
        return {
            form: {
                query: '',
            }
        }
    },
    validations() {
        return {
            form: {
                query: {

                }
            }
        }
    },
    methods: {
        select() {
            this.$emit('querySelected', this.form.query);
        }
    }
}
</script>
<template>
    <div>
        <h6>FHIR 🔥</h6>

        <div class="form-group">
            <label>Query</label>
            <textarea rows="8" class="form-control" @change.prevent="select" v-model="$v.form.query.$model" placeholder="{...}"></textarea>
        </div>

        <div class="alert alert-info alert-sm">
            By providing a query the local station FHIR server will receive this as payload during the train run.
        </div>
    </div>

</template>
