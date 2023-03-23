/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/common';
import type { MasterImage } from '../master-image';
import type { Proposal } from '../proposal';
import type { TrainFile } from '../train-file';
import type {
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainResultStatus,
    TrainRunStatus,
    TrainType,
} from './constants';
import type { UserSecret } from '../../auth';
import type { Station } from '../station';
import type { Registry } from '../registry';
import type { RegistryProject } from '../registry-project';

export interface Train {
    id: string;

    type: TrainType;

    name: string | null;

    query: string | null;

    hash: string | null;

    hash_signed: string | null;

    session_id: string | null;

    entrypoint_file_id: TrainFile['id'];

    entrypoint_file: TrainFile;

    stations: number;

    // ------------------------------------------------------------------

    configuration_status: TrainConfigurationStatus | null;

    // ------------------------------------------------------------------

    build_status: TrainBuildStatus | null;

    // ------------------------------------------------------------------

    run_status: TrainRunStatus | null;

    run_station_id: Station['id'] | null;

    run_station_index: number | null;

    // ------------------------------------------------------------------

    result_status: TrainResultStatus | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    incoming_registry_project_id: RegistryProject['id'] | null;

    incoming_registry_project: RegistryProject | null;

    outgoing_registry_project_id: RegistryProject['id'] | null;

    outgoing_registry_project: RegistryProject | null;

    // ------------------------------------------------------------------

    registry: Registry;

    registry_id: Registry['id'];

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'];

    // ------------------------------------------------------------------

    user_rsa_secret_id: UserSecret['id'] | null;

    user_rsa_secret: UserSecret | null;

    user_paillier_secret_id: UserSecret['id'] | null;

    user_paillier_secret_: UserSecret | null;

    // ------------------------------------------------------------------

    proposal_id: Proposal['id'];

    proposal: Proposal;

    // ------------------------------------------------------------------

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage;
}
