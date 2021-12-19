<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { ProposalStationApprovalStatus } from '@personalhealthtrain/ui-common';
import ProposalStationList from '../../../components/domains/proposal-station/ProposalStationList';
import ProposalStationAction from '../../../components/domains/proposal-station/ProposalStationAction';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';

export default {
    components: {
        ProposalStationAction,
        ProposalStationList,
    },
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
    data() {
        return {
            proposalStationStatus: ProposalStationApprovalStatus,
        };
    },
    methods: {
        handleUpdated(item) {
            this.$emit('proposalStationUpdated', item);

            this.$refs.proposalStationList.editArrayItem(item);
        },
    },
};
</script>
<template>
    <div class="container">
        <div class="row align-items-center">
            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-warm-flame p-1 rounded">
                    <h6 class="mt-1">
                        Risk
                    </h6>
                    <div class="mb-1">
                        <i class="fa fa-exclamation-triangle fa-4x" />
                    </div>
                    <p class="badge badge-success">
                        {{ proposal.risk }}
                    </p>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-warm-flame p-1 rounded">
                    <h6 class="mt-1">
                        MasterImage
                    </h6>
                    <div class="mb-1">
                        <i class="fa fa-compact-disc fa-4x" />
                    </div>
                    <p class="badge badge-dark">
                        {{ proposal.master_image ? proposal.master_image.name : proposal.master_image_id }}
                    </p>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-tempting-azure p-1 rounded">
                    <h6 class="mt-1">
                        Realm
                    </h6>
                    <div class="mb-1">
                        <i class="fas fa-university fa-4x" />
                    </div>
                    <p class="badge badge-dark">
                        {{ proposal.realm_id }}
                    </p>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 text-center">
                <div class="bg-tempting-azure p-1 rounded">
                    <h6 class="mt-1">
                        User
                    </h6>
                    <div class="mb-1">
                        <i class="fa fa-user fa-4x" />
                    </div>
                    <p class="badge badge-dark">
                        {{ proposal.user ? proposal.user.name : proposal.user_id }}
                    </p>
                </div>
            </div>
        </div>
        <div class="mt-5">
            <div class="row">
                <div class="col">
                    <h6>Risk Comment</h6>
                    <p>{{ proposal.risk_comment }}</p>

                    <h6>RequestedData</h6>
                    <p>{{ proposal.requested_data }}</p>
                </div>
                <div class="col">
                    <h6>Created At</h6>
                    <p><timeago :datetime="proposal.created_at" /></p>
                    <h6>Updated At</h6>
                    <p><timeago :datetime="proposal.updated_at" /></p>
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
</style>
