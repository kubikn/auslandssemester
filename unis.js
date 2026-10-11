/*
  UNI-LISTE – die einzige Datei, die du zum Pflegen anfassen musst.
  Quelle: 261011_Auslandssemester Master.pdf (Master Architektur)

  So ergänzt du eine Uni:
    1. Kopiere einen Block von { bis }, inklusive Komma danach.
    2. Füge ihn vor der letzten Zeile "];" ein und ändere die Werte.
    3. Speichern, Seite neu laden – fertig.

  Felder:
    name     Name der Uni
    stadt    Stadt
    land     Land
    lat, lng Koordinaten (Kommazahl mit Punkt). Findest du z. B. per
             Rechtsklick in Google Maps auf den Campus → erste Zeile.
    plaetze  Anzahl Plätze laut Liste            (null = noch offen)
    monate   Monate laut Liste                   (null = noch offen)
    sprache  Unterrichtssprache, z. B. "Englisch" (null = noch offen)
    frist    Bewerbungsfrist, z. B. "15. Januar"  (null = noch offen)
    link     Web-Adresse der Uni                  (null = noch offen)
    bild     Pfad oder Web-Adresse zu einem Foto, z. B. "bilder/wien.jpg"
             (null = Platzhalterbild)

  Fehlende Werte erscheinen auf der Karte als „noch offen“.

  SPRACHE, FRIST, LINK: am 11.10.2026 auf den Websites der Gast-Unis recherchiert.
  Die Fristen sind die Bewerbungsfristen der GAST-Uni für Austausch-
  studierende. Die Heimat-Uni muss vorher nominieren – ihre interne Frist
  liegt meist deutlich früher! Vor der Bewerbung bitte immer nachprüfen;
  Quelle und Stand stehen als Kommentar über jedem Eintrag.

  BITTE PRÜFEN: Koordinaten zeigen auf den Hauptstandort der Uni, nicht
  unbedingt auf die Architektur-Fakultät.
*/

window.UNIS = [
  // ── Italien ─────────────────────────────────────────────
  // Quelle: unicampania.it, International Students. Sprachniveau widersprüchlich (B1 bzw. B2).
  {
    name: "Università degli Studi della Campania Luigi Vanvitelli",
    stadt: "Caserta", land: "Italien",
    lat: 41.0745, lng: 14.3325,
    plaetze: 2, monate: 12,
    sprache: "Italienisch (B1–B2)",
    frist: "WS/Jahr: 1. Apr.–30. Juni · SS: 1. Sep.–30. Nov.",
    link: "https://www.unicampania.it/index.php/international",
    bild: null,
  },
  // Quelle: Scuola di Architettura, Incoming Students + Infosheet 2024/25 (Fristen evtl. veraltet).
  {
    name: "Università degli Studi di Firenze",
    stadt: "Firenze", land: "Italien",
    lat: 43.7779, lng: 11.2594,
    plaetze: 3, monate: 36,
    sprache: "Italienisch (B1) / Englisch (B2)",
    frist: "Herbst/Jahr: 30. Juni · Frühjahr: 30. Nov.",
    link: "https://www.architettura.unifi.it/vp-475-incoming-students.html",
    bild: null,
  },

  // ── Japan ───────────────────────────────────────────────
  // Quelle: NUPACE Application Procedures (Stand 2025/26). Programm heißt NUPACE.
  {
    name: "Nagoya University",
    stadt: "Nagoya", land: "Japan",
    lat: 35.1543, lng: 136.9664,
    plaetze: null, monate: null,
    sprache: "Englisch (NUPACE) & Japanisch",
    frist: "Herbst: 15. März · Frühjahr: 15. Okt.",
    link: "https://nupace.iee.nagoya-u.ac.jp/en/apply/procedures.html",
    bild: null,
  },
  // Quelle: Fact Sheet Fall 2026. Kein eigener Architektur-Studiengang gefunden – bitte prüfen.
  {
    name: "Shizuoka University",
    stadt: "Shizuoka", land: "Japan",
    lat: 34.9654, lng: 138.4330,
    plaetze: null, monate: null,
    sprache: "Japanisch (Master: teils Englisch)",
    frist: "Herbst: 13. April (2026)",
    link: "https://www.suoic.shizuoka.ac.jp/international/exchange-student/",
    bild: null,
  },

  // ── Korea ───────────────────────────────────────────────
  // Quelle: Partner-Factsheets Soongsil 2025/2026. Sprache für Architektur nicht bestätigt.
  {
    name: "Soongsil University",
    stadt: "Seoul", land: "Korea",
    lat: 37.4963, lng: 126.9575,
    plaetze: null, monate: null,
    sprache: "Koreanisch & Englisch",
    frist: "Herbst: 15. Mai · Frühjahr: 15. Nov.",
    link: "https://study.ssu.ac.kr",
    bild: null,
  },
  // Quelle: Yonsei OIA + ESP Student Guide Spring 2027.
  {
    name: "Yonsei University",
    stadt: "Seoul", land: "Korea",
    lat: 37.5658, lng: 126.9386,
    plaetze: null, monate: null,
    sprache: "Englisch & Koreanisch",
    frist: "Herbst: 30. April · Frühjahr: 31. Okt.",
    link: "https://oia.yonsei.ac.kr/inbound.php?mid=m03_03",
    bild: null,
  },

  // ── Niederlande ─────────────────────────────────────────
  // Quelle: Academie van Bouwkunst, Exchange and guest students. Portfolio nötig.
  {
    name: "Amsterdamse Hogeschool voor de Kunsten",
    stadt: "Amsterdam", land: "Niederlande",
    lat: 52.3672, lng: 4.9025,
    plaetze: 1, monate: 5,
    sprache: "Englisch (Master)",
    frist: "1. Semester: 1. April · 2. Semester: 1. Nov.",
    link: "https://www.bouwkunst.ahk.nl/en/application-and-admission/exchange-and-guest-students/",
    bild: null,
  },

  // ── Norwegen ────────────────────────────────────────────
  // Quelle: bas.org Incoming Exchange. Portfolio nötig, mind. 3 Jahre Architekturstudium.
  {
    name: "Bergen Arkitekthøgskole",
    stadt: "Bergen", land: "Norwegen",
    lat: 60.4038, lng: 5.3196,
    plaetze: 2, monate: 10,
    sprache: "Englisch",
    frist: "Herbst: 15. April · Frühjahr: 1. Okt.",
    link: "https://bas.org/utveksling/incoming-exchange/",
    bild: null,
  },
  // Quelle: NTNU How to apply. Herbst-Frist gilt für EU/EWR; mind. 180 ECTS nötig.
  {
    name: "Norges Teknisk-Naturvitenskapelige Universitet",
    stadt: "Trondheim", land: "Norwegen",
    lat: 63.4190, lng: 10.4022,
    plaetze: 3, monate: 30,
    sprache: "Englisch (Master-Kurse)",
    frist: "Herbst: 1. Mai · Frühjahr: 15. Okt.",
    link: "https://www.ntnu.edu/studies/exchange/how_to_apply",
    bild: null,
  },

  // ── Österreich ──────────────────────────────────────────
  // Quelle: TU Wien Fact Sheet 2026/27 (Registrierungsfristen). Deutsch B1 bzw. Englisch B2.
  {
    name: "Technische Universität Wien",
    stadt: "Wien", land: "Österreich",
    lat: 48.1989, lng: 16.3700,
    plaetze: 2, monate: 10,
    sprache: "Deutsch & Englisch (Master)",
    frist: "WS: 31. Mai · SS: 15. Dez.",
    link: "https://www.tuwien.at/international",
    bild: null,
  },

  // ── Polen ───────────────────────────────────────────────
  // Quelle: PK Erasmus Factsheet 2026/27.
  {
    name: "Politechnika Krakowska",
    stadt: "Kraków", land: "Polen",
    lat: 50.0715, lng: 19.9416,
    plaetze: 2, monate: 10,
    sprache: "Englisch (B1-Nachweis)",
    frist: "WS/Jahr: 31. Mai · SS: 15. Nov.",
    link: "https://erasmus.pk.edu.pl/",
    bild: null,
  },

  // ── Schweiz ─────────────────────────────────────────────
  // Quelle: BFH AHB Information Sheet (Stand 2023). Master Architektur liegt in Biel/Fribourg/Genf, nicht Bern.
  {
    name: "BFH Berner Fachhochschule",
    stadt: "Bern", land: "Schweiz",
    lat: 46.9529, lng: 7.4360,
    plaetze: 2, monate: 10,
    sprache: "Deutsch / Englisch (B2–C1)",
    frist: "Herbst: 15. April · Frühjahr: 15. Okt.",
    link: "https://www.bfh.ch/en/studies/international-study/foreign-students/",
    bild: null,
  },

  // ── USA ─────────────────────────────────────────────────
  // Quelle: OU Exchange Student Program + Factsheet 2026/27.
  {
    name: "University of Oklahoma",
    stadt: "Norman", land: "USA",
    lat: 35.2059, lng: -97.4457,
    plaetze: null, monate: null,
    sprache: "Englisch (TOEFL iBT 61)",
    frist: "Herbst: 15. April · Frühjahr: 10. Okt.",
    link: "https://www.ou.edu/globalengagement/iss/students/exchange-students/applying-for-exchange",
    bild: null,
  },
  // Quelle: UW Abroad, Incoming Exchange Students.
  {
    name: "University of Wyoming",
    stadt: "Laramie", land: "USA",
    lat: 41.3149, lng: -105.5666,
    plaetze: null, monate: null,
    sprache: "Englisch (TOEFL iBT 71)",
    frist: "Herbst: 15. März · Frühjahr: 15. Okt.",
    link: "https://www.uwyo.edu/uwyoabroad/incoming-students/incoming-exchange-and-study-abroad-students/index.html",
    bild: null,
  },
];
