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
            validation: {
                email: 'Die Eingabe muss eine gültige E-Mail sein.',
                maxLength: 'Die Länge der Eingabe muss kleiner als {{max}} sein.',
                minLength: 'Die Länge der Eingabe muss größer als {{min}} sein.',
                required: 'Ein Eingabewert wird benötigt.',
                sameAs: 'Der Eingabewert entspricht nicht dem Wert der Eingabe von {{eq}}',
                alphaNum: 'Der Eingabewert darf nur aus folgenden Zeichen bestehen: [0-9a-z]+',
                alphaNumHyphenUnderscore: 'Der Eingabewert darf nur aus folgenden Zeichen bestehen: [0-9a-z-_]+',
                alphaWithUpperNumHyphenUnderscore: 'Der Eingabewert darf nur aus folgenden Zeichen bestehen: [0-9a-zA-Z-_]+',
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
            validation: {
                email: 'The input must be a valid email address.',
                maxLength: 'The length of the input must be less than {{max}}.',
                minLength: 'The length of the input must be greater than {{min}}.',
                required: 'An input value is required.',
                sameAs: 'The input value is not equal to the value of {{eq}}',
                alphaNum: 'The input value is only allowed to consist of the following characters: [0-9a-z]+',
                alphaNumHyphenUnderscore: 'The input value is only allowed to consist of the following characters: [0-9a-z-_]+',
                alphaWithUpperNumHyphenUnderscore: 'The input value is only allowed to consist of the following characters: [0-9a-zA-Z-_]+',
            },
        },
    });

    inject('ilingo', ilingo);
};
