/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, Config } from '@trapi/client';
import {
    MasterImageAPI,
    MasterImageGroupAPI,
    ProposalAPI,
    ProposalStationAPI, RegistryAPI, RegistryProjectAPI, ServiceAPI,
    SettingsOptionAPI,
    StationAPI, TrainAPI, TrainFileAPI, TrainStationAPI,
    UserSecretAPI,
} from '../../domains';

export class HTTPClient extends Client {
    public readonly architecture: SettingsOptionAPI;

    public readonly masterImage : MasterImageAPI;

    public readonly masterImageGroup : MasterImageGroupAPI;

    public readonly proposal : ProposalAPI;

    public readonly proposalStation: ProposalStationAPI;

    public readonly registry : RegistryAPI;

    public readonly registryProject : RegistryProjectAPI;

    public readonly station : StationAPI;

    public readonly train : TrainAPI;

    public readonly trainFile : TrainFileAPI;

    public readonly trainStation : TrainStationAPI;

    public readonly service : ServiceAPI;

    public readonly userSecret : UserSecretAPI;

    constructor(config: Config) {
        super(config);

        this.architecture = new SettingsOptionAPI(this.driver);
        this.masterImage = new MasterImageAPI(this.driver);
        this.masterImageGroup = new MasterImageGroupAPI(this.driver);
        this.proposal = new ProposalAPI(this.driver);
        this.proposalStation = new ProposalStationAPI(this.driver);
        this.registry = new RegistryAPI(this.driver);
        this.registryProject = new RegistryProjectAPI(this.driver);
        this.station = new StationAPI(this.driver);
        this.train = new TrainAPI(this.driver);
        this.trainFile = new TrainFileAPI(this.driver);
        this.trainStation = new TrainStationAPI(this.driver);
        this.service = new ServiceAPI(this.driver);
        this.userSecret = new UserSecretAPI(this.driver);
    }
}
