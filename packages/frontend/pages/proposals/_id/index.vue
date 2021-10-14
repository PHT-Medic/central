<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {ProposalStationApprovalStatus} from "@personalhealthtrain/ui-common";
import ProposalStationStatus from "../../../components/proposal-station/ProposalStationStatus";
import ProposalStationList from "../../../components/proposal-station/ProposalStationList";
import ProposalStationAction from "../../../components/proposal-station/ProposalStationAction";

export default {
    components:{
        ProposalStationAction,
        ProposalStationList,
        ProposalStationStatus
    },
    meta: {
        requireAbility: (can) => {
            return can('edit', 'proposal') || can('drop', 'proposal')
        }
    },
    data() {
        return {
            proposalStationStatus: ProposalStationApprovalStatus
        }
    },
    props: {
        proposal: {
            type: Object,
            default () {
                return {};
            }
        },
        visitorProposalStation: {
            type: Object,
            default: null
        }
    },
    methods: {
        handleUpdated(item) {
            this.$emit('proposalStationUpdated', item);

            this.$refs.proposalStationList.editArrayItem(item);
        }
    }
}
</script>
<template>
    <div class="container">
        <div class="row align-items-center">
            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-warm-flame p-1 rounded">
                    <h6 class="mt-1">Risk</h6>
                    <div class="mb-1">
                        <i class="fa fa-exclamation-triangle fa-4x"></i>
                    </div>
                    <p class="badge badge-success">{{ proposal.risk }}</p>
                </div>

            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-warm-flame p-1 rounded">
                    <h6 class="mt-1">MasterImage</h6>
                    <div class="mb-1">
                        <i class="fa fa-compact-disc fa-4x"></i>
                    </div>
                    <p class="badge badge-dark">{{ proposal.master_image ? proposal.master_image.name :  proposal.master_image_id }}</p>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-tempting-azure p-1 rounded">
                    <h6 class="mt-1">Realm</h6>
                    <div class="mb-1">
                        <i class="fas fa-university fa-4x"></i>
                    </div>
                    <p class="badge badge-dark">{{ proposal.realm_id }}</p>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-tempting-azure p-1 rounded">
                    <h6 class="mt-1">User</h6>
                    <div class="mb-1">
                        <i class="fa fa-user fa-4x"></i>
                    </div>
                    <p class="badge badge-dark">{{ proposal.user ? proposal.user.name : proposal.user_id }}</p>
                </div>
            </div>
        </div>
        <div class="mt-5">
            <div class="row">
                <div class="col-3">
                    <h6>Risk Comment</h6>
                    <p>{{proposal.risk_comment}}</p>

                    <h6>RequestedData</h6>
                    <p>{{proposal.requested_data}}</p>
                </div>
                <div class="col-3">
                    <h6>Created At</h6>
                    <p><timeago :datetime="proposal.created_at" /></p>
                    <h6>Updated At</h6>
                    <p><timeago :datetime="proposal.updated_at" /></p>
                </div>
                <div class="col-6">
                    <proposal-station-list :proposal-id="proposal.id" ref="proposalStationList">
                        <template v-slot:header-actions>
                            <template v-if="visitorProposalStation">
                                <b-dropdown class="dropdown-xs" :no-caret="true">
                                    <template #button-content>
                                        <i class="fa fa-bars"></i> Options
                                    </template>
                                    <proposal-station-action
                                        :proposal-station-id="visitorProposalStation.id"
                                        :approval-status="visitorProposalStation.approval_status"
                                        :with-icon="true"
                                        action-type="dropDownItem"
                                        action="approve"
                                        @done="handleUpdated"
                                    />
                                    <proposal-station-action
                                        :proposal-station-id="visitorProposalStation.id"
                                        :approval-status="visitorProposalStation.approval_status"
                                        :with-icon="true"
                                        action-type="dropDownItem"
                                        action="reject"
                                        @done="handleUpdated"
                                    />
                                </b-dropdown>
                            </template>
                        </template>
                    </proposal-station-list>
                </div>
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


.bg-warm-flame {
    background-image: linear-gradient(45deg, #ff9a9e, #fad0c4 99%, #fad0c4) !important
}

.bg-night-fade {
    background-image: -webkit-gradient(linear, left bottom, left top, from(#a18cd1), to(#fbc2eb)) !important;
    background-image: linear-gradient(0deg, #a18cd1 0, #fbc2eb) !important
}
.bg-sunny-morning {
    background-image: linear-gradient(120deg, #f6d365, #fda085) !important
}
.bg-tempting-azure {
    background-image: linear-gradient(120deg, #84fab0, #8fd3f4) !important
}
.bg-amy-crisp {
    background-image: linear-gradient(120deg, #a6c0fe, #f68084) !important
}
.bg-heavy-rain {
    background-image: -webkit-gradient(linear, left bottom, left top, from(#cfd9df), to(#e2ebf0)) !important;
    background-image: linear-gradient(0deg, #cfd9df 0, #e2ebf0) !important
}
.bg-mean-fruit {
    background-image: linear-gradient(120deg, #fccb90, #d57eeb) !important
}
.bg-malibu-beach {
    background-image: -webkit-gradient(linear, left top, right top, from(#4facfe), to(#00f2fe)) !important;
    background-image: linear-gradient(90deg, #4facfe 0, #00f2fe) !important
}
</style>
