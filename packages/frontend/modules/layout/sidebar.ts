/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LayoutSidebars} from "../../config/layout";
import {LayoutSidebarComponent} from "./types";
import {LayoutNavigationIDType} from "../../modules/layout/types";
import {LayoutNavigationID} from "../../modules/layout/contants";

export function getSidebarComponentsForNavigationId(
    id: LayoutNavigationIDType
) : LayoutSidebarComponent[] {
    return LayoutSidebars[id] ??
        LayoutSidebars[LayoutNavigationID.DEFAULT];
}
