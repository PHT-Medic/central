/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Context} from "@nuxt/types";
import {
    layoutMiddleware
} from "vue-layout-navigation";
import {LayoutKey} from "../config/layout/contants";

export default async function({ store, route } : Context) {
    await layoutMiddleware({store, route, metaKey: LayoutKey.NAVIGATION_ID});
}
