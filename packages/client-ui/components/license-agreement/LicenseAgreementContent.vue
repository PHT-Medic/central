<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const current = ref(1);
        const items = ref([
            { id: 1, name: 'Nutzervereinbarung' },
            { id: 2, name: 'Seitennutzung; Bedingung der Nutzung' },
            { id: 3, name: 'Gültigkeit dieser Vereinbarung' },
            { id: 4, name: 'Regeln für Gewinnspiele, ...' },
            { id: 5, name: 'Diverses' },
            { id: 6, name: 'Kontaktinformationen' },
        ]);

        const change = (id: number) => {
            current.value = id;
        };

        return {
            current,
            items,
            change,
        };
    },
});
</script>
<template>
    <div>
        <ul class="nav flex-column nav-pills">
            <li
                v-for="(item) in items"
                :key="item.id"
                class="nav-item"
            >
                <button
                    class="nav-link"
                    style="width: 100%"
                    :class="{'active': current === item.id}"
                    @click.prevent="change(item.id)"
                >
                    {{ item.id }}. {{ item.name }}
                </button>
            </li>
        </ul>
        <hr>
        <div style="max-height: 400px; overflow-y: scroll; padding-right: 0.5rem">
            <div v-if="current === 1">
                <h4>Nutzervereinbarung</h4>
                <div>
                    <h5>Einleitung</h5>
                    <p>
                        Dies ist die zentrale Nutzerseite des Open-Source Projekts Personal Health Train (PHT) – meDIC
                        (im Folgenden „<strong>Seite</strong>“ genannt).
                    </p>
                    <p>
                        Diese Nutzervereinbarung (im Folgenden „<strong>Vereinbarung</strong>“ genannt) legt das Verhältnis
                        zwischen dem „Personal Health Train meDIC) (im Folgenden „<strong>wir</strong>“ oder „<strong>uns</strong>“ genannt)
                        und jedem Nutzer der Seite
                        (im Folgenden „<strong>Sie</strong>“, „<strong>Nutzer</strong>“ oder „<strong>Analyst</strong>“ genannt)
                        fest und reguliert die Nutzung dieser Seite durch Sie.
                    </p>
                    <p>
                        Bitte lesen Sie sich diese Vereinbarung aufmerksam durch, bevor Sie die Seite verwenden.
                        Durch die Nutzung der Seite stimmen Sie den Bedingungen dieser Vereinbarung zu.
                        Falls Sie den Bedingungen dieser Vereinbarung nicht zustimmen, dürfen Sie diese Seite nicht aufrufen oder anderweitig nutzen.
                    </p>
                    <p>
                        Wir behalten uns das jederzeitige Recht vor, diese Vereinbarung mit vorheriger Mitteilung
                        nach unserem eigenen Ermessen zu ändern.
                        Das Datum der letzten Aktualisierung am Ende dieser Vereinbarung zeigt an, wann die letzten Änderungen vorgenommen wurden.
                        Indem Sie die Seite aufrufen und verwenden, nachdem diese Vereinbarung geändert bzw. aktualisiert wurde,
                        stimmen Sie diesen Änderungen der Vereinbarung zu.
                        Aus diesem Grund sollten Sie diese Vereinbarung vor jeder Nutzung der Seite durchlesen.
                    </p>
                    <p>
                        Zudem unterliegen Sie bei der Nutzung bestimmter Dienstleistungen oder Funktionen der Seite jeglichen
                        veröffentlichten Richtlinien zu diesen Dienstleistungen und Funktionen.
                        All diese Richtlinien sind Bestandteil dieser Vereinbarung.
                        Das Projekt Personal Health Train (PHT) – meDIC unterfällt nicht dem Medizinprodukte-Durchführungsgesetz.
                        Seine Benutzung ist kostenlos.
                    </p>
                </div>
                <div>
                    <h5>Datenschutz</h5>

                    <p>
                        Die Nutzung der Seite unterliegt den Bedingungen der dort aufgeführten Datenschutzrichtlinie,
                        die Bestandteil dieser Vereinbarung ist. Bitte lesen Sie sich unsere Datenschutzrichtlinie sorgfältig durch.
                    </p>
                    <p>
                        Indem Sie diese Seite nutzen, stimmen Sie den Bedingungen unserer Datenschutzrichtlinie zu.
                        Wir behalten uns das Recht vor, Informationen bezüglich Ihrer Nutzung dieser Seite und jegliche
                        anderen personenbezogenen Daten,
                        die Sie uns im Rahmen der Datenschutzrichtlinie zur Verfügung stellen, zu verwenden.
                        Im Cache befinden sich ausschließlich funktionale Cookies.
                    </p>
                    <p>
                        Wir erheben für die Verarbeitung lediglich Ihren Namen und E-Mail-Adresse als Personenbezogene Daten.
                        Zusätzlich für die Funktionalität werden diese Daten erfasst:
                    </p>
                    <p>
                        Folgende Daten werden unter anderem von Ihnen erfasst:
                        Nutzername, E-Mail-Adresse, Public Keys, Analysecode, Verschlüsselte Ergebnisse, Signatur vom Hash, FHIR-Abfragen, ...
                    </p>
                </div>
                <div>
                    <h5>Links, Websites Dritter</h5>

                    <p>
                        Links zu Webseiten Dritter werden für Sie lediglich aus praktischen Gründen bereitgestellt.
                        Bei Nutzung dieser Links verlassen Sie diese Seite.
                        Wir haben keinen Einfluss auf externe Seiten und unterstützen diese in keiner Weise.
                        Sie stimmen zu, dass wir nicht für Angaben, Güter oder Dienstleistungen haften,
                        die über diese externen Websites bereitgestellt werden oder deren Richtigkeit.
                        Sie nutzen diese Links auf eigene Gefahr.
                    </p>
                    <p>
                        Wir weisen Sie darauf hin, dass andere Webseiten im Internet,
                        darunter unter Umständen auch die hier verlinkten externen Webseiten, eventuell Material oder Angaben enthalten,
                        die für bestimmte Personen beleidigend oder unangemessen sind; oder die inakkurat, nicht wahrheitsgemäß,
                        irreführend oder täuschend sind; oder die verleumderisch sind,
                        die Rechte anderer verletzen oder auf sonstige Weise nicht rechtmäßig sind.
                        Wir weisen jede Verantwortung für die Inhalte, Rechtmäßigkeit, Angemessenheit oder Genauigkeit dieser Informationen oder
                        jeglicher auf den Websites Dritter dargestellten Angaben, Produkte oder Dienstleistungen ausdrücklich zurück.
                    </p>
                </div>
                <div>
                    <h5>Haftungsausschluss</h5>

                    <p>Sie verstehen und erkennen ausdrücklich an, dass:</p>
                    <p>Die Nutzung der Seite auf Ihre eigene Gefahr erfolgt;</p>
                    <p>
                        die Seite und die damit generierten Analysen und Ergebnisse ohne Anspruch auf Richtigkeit
                        und in der von uns vorgegebenen Form bereitgestellt werden.
                        Sofern in dieser Vereinbarung nicht ausdrücklich anders bestimmt, übernehmen wir keinerlei Haftung für die Nutzung.
                        Sofern in dieser Vereinbarung nicht ausdrücklich anders bestimmt,
                        übernehmen wir keine Haftung dafür, dass (i) die Seite ihre Anforderungen erfüllt, (ii) die Seite ununterbrochen,
                        zeitgerecht, sicher oder fehlerfrei funktioniert,
                        (iii) die Ergebnisse der Nutzung dieser Seite akkurat oder zuverlässig sind,
                        (iv) die Qualität jeglicher Dienstleistungen, Informationen oder sonstigen Materialien,
                        die Sie im Rahmen der Nutzung der Seite erhalten, Ihre Erwartungen erfüllt,
                        und (v) jegliche Fehler auf der Seite korrigiert werden.
                    </p>
                    <p>
                        Der Betrieb der Seite erfolgt nach bestem Wissen und Gewissen. Jegliches Material,
                        das im Rahmen der Nutzung der Dienstleistung heruntergeladen oder auf sonstige Weise zur Verfügung gestellt wird,
                        geschieht auf eigene Gefahr.
                        Sie tragen allein die Verantwortung für jegliche Schäden an Ihrem Computersystem oder für Datenverluste,
                        die durch das Herunterladen von solchem Material entstehen.
                    </p>
                    <p>
                        Als Nutzer sind Sie selbst verantwortlich für die Prüfung, ob und in welchem Umfang die
                        generierte Information z-B. im Rahmen eines Behandlungsvertrags für Sie anwendbar ist.
                    </p>

                    <h6>Haftungsbeschränkung</h6>

                    <p>
                        Wir haften nur für Schäden, die auf Vorsatz oder grobe Fahrlässigkeit beruhen
                        und im Falle der Verletzung wesentlicher Vertragspflichten,
                        deren Verletzung die Erreichung des Vertragszwecks gefährdet,
                        oder für die Verletzung von Pflichten, deren Erfüllung die ordnungsgemäße Durchführung
                        des Vertrages überhaupt erst ermöglicht.
                    </p>
                    <p>
                        Im Falle einfacher Fahrlässigkeit haften wir nur für den vorhersehbaren, vertragstypischen Schaden.
                        Wir haften nicht für die leicht fahrlässige Verletzung anderer als der in den vorstehenden Sätzen genannten Pflichten.
                        Die vorstehenden Haftungsbeschränkungen gelten nicht bei Verletzung von Leib,
                        Leben und Gesundheit, und bei arglistig verschwiegenen Mängeln.
                        Dies gilt auch für die persönliche Haftung von Arbeitnehmern, Vertretern und Erfüllungs- und Verrichtungsgehilfen.
                        Die Haftung nach weiteren gesetzlichen Vorschriften bleibt unberührt.
                    </p>
                </div>
                <div>
                    <h5>Schadloshaltung</h5>

                    <p>
                        Sie erklären sich hiermit bereit, uns gegen sämtliche Ansprüche, Forderungen, Klagegründe, Verluste,
                        Ausgaben, Schäden und Kosten, einschließlich aller angemessenen Anwaltskosten, schad- und klaglos zu halten,
                        die aus Ihrer Nutzung der Seite oder Ihres Verhaltens auf der Seite entstehen.
                        Dies umfasst jegliche Aktivität in Bezug auf die Nutzung der Seite durch Sie, jedes von Ihnen gesendete,
                        hochgeladene oder über die Seite übermittelte Material, jegliche Verletzung dieser Vereinbarung oder der Rechte Dritter.
                    </p>
                </div>
            </div>
            <div v-if="current === 2">
                <h4>Seitennutzung; Bedingung der Nutzung</h4>

                <div>
                    <h5>Allgemein</h5>
                    <p>Wenn Sie Angaben auf dieser Seite machen, erklären sie sich bereit:</p>

                    <p>
                        (a) wahrheitsgemäße, akkurate, aktuelle und vollständige Angaben zu Ihrer Person
                        wie von der Seite aufgefordert zu machen, und
                    </p>
                    <p>
                        (b) wann auch immer möglich, diese Angaben zeitnah zu aktualisieren und wahrheitsgemäß,
                        akkurat, aktuell und vollständig zu halten.
                        Falls Sie Angaben machen, die falsch, ungenau, nicht mehr aktuell oder unvollständig sind,
                        oder falls wir Grund zur Annahme haben,
                        dass die Informationen falsch, ungenau, nicht mehr aktuell oder unvollständig sind, behalten wir uns vor,
                        Ihren Zugang zur Seite auszusetzen oder zu kündigen und jegliche aktuelle oder künftige Nutzung der Seite
                        (ganz oder teilweise) durch Sie zu verbieten.
                    </p>
                    <p>
                        Sie stimmen zu, diese Seite nur zu rechtmäßigen Zwecken zu verwenden und erkennen an,
                        für Ihre Nutzung und Kommunikationen auf der Seite verantwortlich zu sein.
                        Sie stimmen zu, auf dieser Seite keine rechtswidrigen, verletzenden, bedrohlichen, belästigenden, diffamierenden,
                        vulgären, obszönen, profanen, anstößigen, beleidigenden,
                        hasserfüllten oder auf sonstige Weise unangenehmen Inhalte zu posten oder über diese Seite zu vermitteln.
                        Dazu gehört jedes Material mit strafbaren Handlungen oder Handlungen, die zivilrechtliche Haftungsansprüche nach sich ziehen,
                        das geistige Eigentum anderer verletzt oder auf sonstige Weise regionale,
                        landesweite, nationale oder internationale Gesetze verletzt. Sie stimmen zu, diese Seite auf keine Art und Weise zu verwenden,
                        die ihren normalen Betrieb bzw. die Nutzung eines anderen Nutzers beeinträchtigt.
                        Im Falle der Zuwiderhandlung behalten wir uns alles daraus folgenden Ansprüche vor.
                    </p>
                </div>
                <div>
                    <h5>Ausführung der Algorithmen</h5>

                    <p>
                        Sie garantieren, dass Sie während der Nutzung unserer Seite keine böswilligen Absichten verfolgen,
                        keinen bewussten Schaden anrichten und nicht den Versuch unternehmen,
                        schützenswerte oder sensitive Informationen zu erlangen. Analysen dürfen ausschließlich auf von uns
                        erstellten Master Images (Software-Umgebung, Programmabhängigkeiten sowie Train Library  ) basieren.
                    </p>
                    <p>
                        Sie garantieren, dass Sie während der Nutzung unserer Seite keine böswilligen Absichten verfolgen,
                        keinen bewussten Schaden anrichten und nicht den Versuch unternehmen,
                        schützenswerte oder sensitive Informationen zu erlangen. Analysen dürfen ausschließlich auf von uns
                        erstellten Master Images (Software-Umgebung, Programmabhängigkeiten sowie Train Library  ) basieren.
                    </p>
                </div>
                <div>
                    <h5>Analyse-Ergebnisse</h5>

                    <p>
                        Die Ergebnisse von Analysen sind verschlüsselt at Rest. Dies bedeutet,
                        nur Analysten und Teilnehmende Stationen sind in der Lage, diese mit ihren privaten Schlüsseln zu entschlüsseln.
                        Keiner von uns ist in der Lage, die Ergebnisse selbst zu entschlüsseln oder gar einzusehen.
                        Die verschlüsselten Ergebnisse werden zum Download bereitgestellt und somit in die Verantwortung
                        des jeweiligen Nutzers übergeben.
                        Der Nutzer verpflichtet sich hiermit, die Ergebnisse im Einklang mit Datenschutzrichtlinien
                        und unter Beachtung guter wissenschaftlicher Praxis weiterzuverarbeiten.
                    </p>
                </div>
                <div>
                    <h5>Desktop App</h5>

                    <p>
                        Die Ergebnisse von Analysen sind verschlüsselt at Rest. Dies bedeutet,
                        nur Analysten und Teilnehmende Stationen sind in der Lage, diese mit ihren privaten Schlüsseln zu entschlüsseln.
                        Keiner von uns ist in der Lage, die Ergebnisse selbst zu entschlüsseln oder gar einzusehen.
                        Die verschlüsselten Ergebnisse werden zum Download bereitgestellt und somit in die Verantwortung
                        des jeweiligen Nutzers übergeben.
                        Der Nutzer verpflichtet sich hiermit,
                        die Ergebnisse im Einklang mit Datenschutzrichtlinien und unter Beachtung guter wissenschaftlicher Praxis weiterzuverarbeiten.
                    </p>
                </div>
            </div>
            <div v-if="current === 3">
                <h4>Gültigkeit dieser Vereinbarung</h4>
                <p>
                    Diese Vereinbarung ist gültig, bis sie entweder von Ihnen oder von uns gekündigt wird.
                    Sie und wir können diese Vereinbarung jederzeit schriftlich kündigen.
                    Dies hat zur Folge, dass Sie jegliche künftige Nutzung der Seite zu unterlassen haben.<br>
                    Ergebnisse und Analysen, die durch Ihre bisherige Nutzung entstanden sind, verbleiben auf der Seite.
                </p>
                <p>
                    Wir behalten uns vor, diese Vereinbarung zu jeder Zeit und ohne vorherige Ankündigung zu kündigen oder auszusetzen und
                    Ihnen dementsprechend Zugang zur Seite zu verweigern,
                    falls Sie im alleinigen Ermessen von uns diese Bedingungen oder jegliche Bestimmung dieser Vereinbarung verletzen oder
                    Ihre Nutzung den Interessen eines anderen Nutzers schadet.
                </p>
                <p>
                    Wir behalten uns das Recht vor, die Seite (ganz oder teilweise) mit oder ohne vorherige Ankündigung kurz- oder langfristig
                    zu ändern oder ganz einzustellen.
                    Sofern in dieser Vereinbarung nicht ausdrücklich anderweitig bestimmt, stimmen Sie zu, dass wir Ihnen oder jeglichen Dritten
                    gegenüber für keine Änderungen,
                    Aussetzungen oder Einstellungen der Seite haften.
                </p>
                <p>
                    Wir behalten uns das Recht vor, die Seite (ganz oder teilweise) mit oder ohne vorherige Ankündigung kurz- oder langfristig
                    zu ändern oder ganz einzustellen.
                    Sofern in dieser Vereinbarung nicht ausdrücklich anderweitig bestimmt, stimmen Sie zu,
                    dass wir Ihnen oder jeglichen Dritten  gegenüber für keine Änderungen,
                    Aussetzungen oder Einstellungen der Seite haften.
                </p>
            </div>
            <div v-if="current === 4">
                <h4>Regeln für Gewinnspiele, Verlosungen, Umfragen und ähnliche Aktionen</h4>

                <p>
                    Jegliche Gewinnspiele, Verlosungen, Umfragen und ähnliche Aktionen, die von uns über die Seite bereitgestellt werden,
                    unterliegen bestimmten Regeln,
                    separat von und zusätzlich zu dieser Vereinbarung. Durch die Teilnahme bei einem solchen Gewinnspiel, einer solchen Verlosung,
                    Umfrage oder ähnlichen Aktion unterstellen Sie sich diesen Regeln,
                    die eventuell von den Bestimmungen dieser Vereinbarung abweichen.
                    Wir raten Ihnen dringend, die jeweiligen Nutzungsbestimmungen zu lesen, die bei der Aktivität verlinkt werden,
                    sowie unsere Datenschutzrichtlinie durchzulesen,
                    die zusätzlich zu dieser Vereinbarung alle Informationen reguliert, die Sie im Zusammenhang mit diesen Aktivitäten einreichen.
                </p>
                <div>
                    <h5>Geltendes Recht</h5>
                    <p>
                        Diese Vereinbarung unterliegt ausschließlich den Gesetzen der Bundesrepublik Deutschland.
                    </p>
                </div>
                <div>
                    <h5>Salvatorische Klausel; Auslegung</h5>
                    <p>
                        Falls eine Bestimmung dieser Vereinbarung unrechtmäßig,
                        ungültig oder aus einem beliebigen Grund nicht durch ein Gericht oder eine ermächtigte
                        Rechtsprechung durchgesetzt werden kann,
                        betrifft das nicht die Gültigkeit oder Durchsetzbarkeit der übrigen Bestimmungen.
                    </p>
                </div>
                <div>
                    <h4>Gesamte Vereinbarung</h4>
                    <p>
                        Diese Vereinbarung stellt die gesamte und einzige Vereinbarung zwischen uns und jedem Nutzer dieser Seite
                        in Bezug auf den Gegenstand dieser Vereinbarung dar und ersetzt jegliche vorherige oder zwischenzeitliche
                        Vereinbarungen,
                        Darlegungen, Gewährleistungen und Übereinkünfte, ob schriftlich oder mündlich,
                        in Bezug auf den Gegenstand dieser Vereinbarung.
                    </p>
                </div>
            </div>
            <div v-if="current === 5">
                <h4>Diverses</h4>

                <p>
                    Sollte wir nicht auf eine strikte Einhaltung einer Bestimmung in dieser Vereinbarung bestehen,
                    stellt dies keine Verzichtserklärung auf die jeweilige Bestimmung dar
                    und soll nicht als Verzichtserklärung gelten oder das Recht der Partei einschränken,
                    auf eine strenge Einhaltung dieser Bestimmung oder jeder anderen Bestimmung in dieser Vereinbarung zu bestehen.
                </p>
            </div>
            <div v-if="current === 6">
                <h4>Kontaktinformationen</h4>

                <p>
                    Bei Kommentaren, Fragen oder Beschwerden zu dieser Vereinbarung oder falls Sie eine Verletzung dieser
                    Vereinbarung melden wollen, kontaktieren Sie uns bitte über
                    <a href="mailto:pht@medizin.uni-tuebingen.de">pht@medizin.uni-tuebingen.de</a>.
                    Wir bearbeiten jede Anfrage schnellstmöglich und nach bestem Wissen.
                </p>
            </div>
        </div>
        <hr>
        <h6>Stand: 21. November 2022</h6>
    </div>
</template>
