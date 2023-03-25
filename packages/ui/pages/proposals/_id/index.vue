<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue from 'vue';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { ProposalStationList } from '../../../components/domains/proposal-station/ProposalStationList';
import ProposalStationApprovalStatus from '../../../components/domains/proposal-station/ProposalStationApprovalStatus';

export default Vue.extend({
    components: { ProposalStationApprovalStatus, ProposalStationList },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    props: {
        proposal: {
            type: Object,
            default() {
                return {};
            },
        },
        visitorProposalStation: {
            type: Object,
            default: null,
        },
    },
    computed: {
        proposalStationQuery() {
            return {
                filter: {
                    proposal_id: this.proposal.id,
                },
                sort: {
                    station: {
                        name: 'ASC',
                    },
                },
            };
        },
    },
});
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <h6><i class="fa-solid fa-info" /> Info</h6>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>Trains</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-train-tram fa-4x" />
                                </div>
                                <p class="badge badge-dark">
                                    {{ proposal.trains }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>MasterImage</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-compact-disc fa-4x" />
                                </div>
                                <p class="badge badge-dark">
                                    {{ proposal.master_image ? proposal.master_image.name : proposal.master_image_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>Risk</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col">
                                        <div class="text-center">
                                            <div class="mb-1">
                                                <i class="fa fa-exclamation-triangle fa-4x" />
                                            </div>
                                            <span class="badge badge-success">
                                                {{ proposal.risk }}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        v-if="proposal.risk_comment"
                                        class="col"
                                    >
                                        <div>
                                            <strong>Comment</strong>
                                            <br>
                                            {{ proposal.risk_comment }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>Realm</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fas fa-university fa-4x" />
                                </div>
                                <p class="badge badge-dark">
                                    {{ proposal.realm_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>User</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-user fa-4x" />
                                </div>
                                <p class="badge badge-dark">
                                    {{ proposal.user_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <proposal-station-list
                    :with-search="false"
                    :query="proposalStationQuery"
                >
                    <template #items="{ items }">
                        <div class="list">
                            <template v-for="item in items">
                                <div
                                    :key="item.id"
                                    class="list-item card mb-2"
                                >
                                    <div class="card-header">
                                        <h5>{{ item.station.name }}</h5>
                                    </div>
                                    <div class="card-body">
                                        <strong>Status</strong> <proposal-station-approval-status :status="item.approval_status" />
                                        <br>
                                        <strong>Comment</strong><br> {{ item.comment || 'No comment' }}
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </proposal-station-list>
            </div>
        </div>
    </div>
</template>
<style>
.proposal-stats > div {
    min-width: 120px;
}

.widget-content {
    padding: 1rem;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.widget-content .widget-content-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    position: relative;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.widget-content .widget-content-left {
    align-items: center;
    display: flex;
}

.widget-content .widget-content-left .widget-heading {
    opacity: .8;
    font-weight: 700;
    text-align: left;
}

.widget-content .widget-content-left .widget-subheading {
    opacity: .5;
}

.widget-content .widget-content-right {
    margin-left: auto;
}

.widget-content .widget-numbers {
    font-weight: 700;
    font-size: 1.8rem;
    display: block;
}
</style>
