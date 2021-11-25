<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        title: {
            type: Object,
            default: {},
        },
    },
    created() {
        console.log(this.title);
    },
};
</script>

<template>
    <div>
        <div
            v-if="title"
            class="form-group"
            :class="{ 'form-group-error': title.$error }"
        >
            <label>Titel</label>
            <input
                v-model="title.$model"
                type="text"
                class="form-control"
                placeholder="..."
            >

            <div
                v-if="!title.required"
                class="form-group-hint group-required"
            >
                Bitte geben Sie einen Titel für den Zug an.
            </div>
            <div
                v-if="!title.minLength"
                class="form-group-hint group-required"
            >
                Der Titel für den Antrag muss mindestens <strong>{{ title.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
            <div
                v-if="!title.maxLength"
                class="form-group-hint group-required"
            >
                Der Titel für den Antrag darf maximal <strong>{{ title.$params.maxLength.max }}</strong> Zeichen lang sein.
            </div>
        </div>
    </div>
</template>
