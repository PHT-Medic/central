/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Ilingo } from 'ilingo';
import { Inject } from '@nuxt/types/app';

export default async (ctx: Context, inject: Inject) => {
    const ilingo = new Ilingo();

    ilingo.setCache({
        de: {
            app: {
                delete: {
                    hint: 'Sind Sie sicher, dass das Objekt gelöscht werden soll?',
                    button: 'Löschen',
                    okTitle: 'Ok',
                    cancelTitle: 'Abbrechen',
                },
            },
            validator: {
                alt: 'Die Bedingung des Operators {{validator}} ist nicht erfüllt.',
            },
        },
        en: {
            app: {
                delete: {
                    hint: 'Are you sure, that you want to delete this entity?',
                    button: 'Drop',
                    okTitle: 'Ok',
                    cancelTitle: 'Cancel',
                },
            },
            validator: {
                alt: 'The {{validator}} operator condition is not fulfilled.',
            },
        },
    });

    inject('ilingo', ilingo);
};
