<script>
export default {

}
</script>
<template>
  <div class="text-left">
    <h4 class="title m-b-10">
      Train - Sendung
    </h4>
    <form>
      <div class="form-group">
        <label>Base Image</label>
        <select class="form-control">
          <option>--Bitte auswählen--</option>
        </select>
      </div>
      <div class="form-group">
        <label>Entrypoint</label>
        <select class="form-control">
          <option>--Bitte auswählen--</option>
        </select>
      </div>
      <div class="form-group">
        <label>Algorithmus</label>
        <div class="custom-file">
          <input id="algorithm-file" type="file" class="custom-file-input">
          <label class="custom-file-label" for="algorithm-file">Algorithmus auswählen...</label>
        </div>
      </div>
    </form>
  </div>
</template>
