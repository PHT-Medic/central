<script>
export default {
  props: {
    proposal: {
      type: Object,
      default () {
        return {};
      }
    }
  }
}
</script>
<template>
  <div class="text-left">
    <p>Der Antrag <strong>{{ proposal.title }}</strong> wurde bisher von <strong>?/?</strong> Krankenhäusern angenommen.</p>
  </div>
</template>
