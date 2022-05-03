/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SocketServerToClientEventName, SocketServerToClientItem } from '@personalhealthtrain/central-common';

export type SocketServerToClientEventConfigurationItem = {
    namespace?: string,
    roomNameFn: (id?: string | number) => string
};

export type SocketServerToClientEventContext<EventName extends SocketServerToClientEventName> = {
    configuration: SocketServerToClientEventConfigurationItem[],
    operation: EventName,
    item: SocketServerToClientItem<EventName>
};
