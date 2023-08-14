/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import css from 'rollup-plugin-css-only';
import vue from '@vitejs/plugin-vue';

import fs from 'node:fs';

import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
    defaultExport: true,
    pkg: JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), {encoding: 'utf-8'})),
    pluginsPost: [
        vue(),
        css({  output: 'index.css'})
    ],
    external: [
        /@vue-layout\/form-controls\//i,
        /@vue-layout\/list-controls\//i
    ]
});
