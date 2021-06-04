<template>
    <b-list-group>
        <b-list-group-item class="flex-column align-items-start list-group-item-sm">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="align-items-center">
                    <h6
                        class="m-b-0 font-weight-bold d-inline"
                    >1. Allgemein <small>Übernehmen der Konifguration(en).</small></h6>
                    <p>
                        Die in dem vorherigen Schritt angegebenen Informationen werden gespeichert.
                    </p>
                </div>
                <div>
                    <div :class="{'spinner-border': formInfo.trainPushInProgress}" style="font-size: 2rem;">
                        <i v-if="!formInfo.trainPushInProgress" class="fa fa-check text-success"></i>
                    </div>
                </div>
            </div>

        </b-list-group-item>
        <b-list-group-item class="flex-column align-items-start list-group-item-sm">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="align-items-center">
                    <h6
                        class="m-b-0 font-weight-bold d-inline"
                    >2. Upload <small>Upload der Entrypoint-Datei(en).</small></h6>
                    <p>
                        Die Dateien werden hochgeladen und dem Zug zugewiesen.
                    </p>
                </div>
                <div>
                    <div :class="{'spinner-border': formInfo.trainFilesSyncInProgress}" style="font-size: 2rem;">
                        <i v-if="!formInfo.trainFilesSyncInProgress" class="fa fa-check text-success"></i>
                    </div>
                </div>
            </div>

        </b-list-group-item>
    </b-list-group>
</template>
