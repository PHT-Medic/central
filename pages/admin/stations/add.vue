<script>
import {LayoutNavigationAdminId} from "@/config/layout.ts";

export default {
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility: (can) => {
            return can('add','station') || can('edit','station') || can('drop','station')
        }
    }
}
</script>
<template>
    <div class="container">
        <h4 class="title m-b-10">
            Station <span class="sub-title">Hinzufügen</span>
        </h4>

        <div class="panel-card">
            <div class="panel-card-body">
                <div class="row">
                    <div class="col-6">
                        <h6 class="title font-weight-bold">Allgemein</h6>

                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>
                        <div class="form-group">
                            <label>Beschreibung</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>

                        <hr />

                        <h6 class="title font-weight-bold">UI</h6>

                        <div class="form-group">
                            <label>Client Id</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>
                        <div class="form-group">
                            <label>Client Secret</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>
                    </div>
                    <div class="col-6">
                        <h6 class="title font-weight-bold">Authentifizierung</h6>

                        <div class="form-group">
                            <label>Schema</label>
                            <select class="form-control">
                                <option>Oauth2</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Provider</label>
                            <select class="form-control">
                                <option>Keycloak</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Grant Type</label>
                            <select class="form-control">
                                <option>Auth Code</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>API Endpoint</label>
                            <input type="text" class="form-control" placeholder="https://......" />
                        </div>
                        <div class="form-group">
                            <label>Client ID</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>
                        <div class="form-group">
                            <label>Client Secret</label>
                            <input type="text" class="form-control" placeholder="..." />
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel-card-body">
                <button type="button" class="btn btn-primary btn-xs">
                    Erstellen
                </button>
            </div>
        </div>
    </div>
</template>
