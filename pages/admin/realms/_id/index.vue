<script>
export default {
    props: {
        realm: Object
    }
}
</script>
<template>
    <div>
        <h5>Station</h5>
        <div class="alert alert-info alert-sm">
            Associate a station to the realm, to be a target of a train.
        </div>
        <nuxt-link :to="'/admin/realms/'+realm.id+'/station'" class="btn btn-xs btn-dark">
            Associate
        </nuxt-link>

        <hr />
    </div>
</template>
