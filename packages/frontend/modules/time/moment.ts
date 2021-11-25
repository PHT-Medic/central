/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import moment from 'moment';

moment.locale('de', {
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    relativeTime: {
        future: 'in %s',
        past: 'vor %s',
        s: 'einigen Sekunden',
        m: 'einer Minute',
        mm: '%d Minuten',
        h: 'einer Stunde',
        hh: '%d Stunden',
        d: 'einem Tag',
        dd: '%d Tagen',
        M: 'einem Monat',
        MM: '%d Monaten',
        y: 'einem Jahr',
        yy: '%d Jahren',
    },
});

moment.locale('de');

export default moment;
