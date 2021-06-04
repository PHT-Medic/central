<script>
    export default {
        props: {
            title: {
                type: Object,
                default: {}
            }
        },
        created() {
            console.log(this.title);
        }
    }
</script>

<template>
    <div>
        <div v-if="this.title" class="form-group" :class="{ 'form-group-error': this.title.$error }">
            <label>Titel</label>
            <input v-model="this.title.$model" type="text" class="form-control" placeholder="...">

            <div v-if="!this.title.required" class="form-group-hint group-required">
                Bitte geben Sie einen Titel für den Zug an.
            </div>
            <div v-if="!this.title.minLength" class="form-group-hint group-required">
                Der Titel für den Antrag muss mindestens <strong>{{ this.title.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
            <div v-if="!this.title.maxLength" class="form-group-hint group-required">
                Der Titel für den Antrag darf maximal <strong>{{ this.title.$params.maxLength.max }}</strong> Zeichen lang sein.
            </div>
        </div>
    </div>
</template>
