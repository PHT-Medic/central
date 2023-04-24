/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client } from 'hapic';
import {
    MasterImageAPI,
    MasterImageGroupAPI,
    ProposalAPI,
    ProposalStationAPI,
    RegistryAPI,
    RegistryProjectAPI,
    ServiceAPI,
    StationAPI,
    TrainAPI,
    TrainFileAPI,
    TrainLogAPI,
    TrainStationAPI,
    UserSecretAPI,
} from '../domains';

export class APIClient extends Client {
    public readonly masterImage : MasterImageAPI;

    public readonly masterImageGroup : MasterImageGroupAPI;

    public readonly proposal : ProposalAPI;

    public readonly proposalStation: ProposalStationAPI;

    public readonly registry : RegistryAPI;

    public readonly registryProject : RegistryProjectAPI;

    public readonly station : StationAPI;

    public readonly train : TrainAPI;

    public readonly trainFile : TrainFileAPI;

    public readonly trainLog: TrainLogAPI;

    public readonly trainStation : TrainStationAPI;

    public readonly service : ServiceAPI;

    public readonly userSecret : UserSecretAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.masterImage = new MasterImageAPI({ client: this });
        this.masterImageGroup = new MasterImageGroupAPI({ client: this });
        this.proposal = new ProposalAPI({ client: this });
        this.proposalStation = new ProposalStationAPI({ client: this });
        this.registry = new RegistryAPI({ client: this });
        this.registryProject = new RegistryProjectAPI({ client: this });
        this.station = new StationAPI({ client: this });
        this.train = new TrainAPI({ client: this });
        this.trainFile = new TrainFileAPI({ client: this });
        this.trainLog = new TrainLogAPI({ client: this });
        this.trainStation = new TrainStationAPI({ client: this });
        this.service = new ServiceAPI({ client: this });
        this.userSecret = new UserSecretAPI({ client: this });
    }
}
