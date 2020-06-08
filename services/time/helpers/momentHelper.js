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
        yy: '%d Jahren'
    }
});

moment.locale('de');
moment.utc();

const momentHelper = moment;

export default momentHelper;
