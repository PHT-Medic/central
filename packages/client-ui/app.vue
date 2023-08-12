<script>
import { defineNuxtComponent, useHead } from '#app';

export default defineNuxtComponent({
    setup() {
        useHead({
            charset: 'utf-8',
            titleTemplate: 'PHT - User Interface (UI)',
            meta: [],
            link: [],
        });
    },
});
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
