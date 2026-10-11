(function () {
  "use strict";

  // Grobe Karte für die Weltansicht, feine Karte erst beim Hineinzoomen
  const WORLD_COARSE = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  const WORLD_FINE = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";
  const FINE_FROM_ZOOM = 3;
  const PIN_GAP = 22; // Pins, die näher als so viele Pixel liegen, werden aufgefächert
  const OPEN = "noch offen";

  const status = document.getElementById("status");
  function showStatus(text) {
    status.textContent = text;
    status.hidden = false;
  }

  if (!window.d3 || !window.topojson) {
    showStatus("Die Karte konnte nicht geladen werden. Bitte Internetverbindung prüfen und neu laden.");
    return;
  }

  // ── Daten prüfen ───────────────────────────────────────
  function validCoord(value, limit) {
    return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
  }

  const unis = [];
  (window.UNIS || []).forEach((u, i) => {
    if (!u || !validCoord(u.lat, 90) || !validCoord(u.lng, 180)) {
      const label = (u && u.name) || `Eintrag Nr. ${i + 1}`;
      console.warn(`Uni übersprungen – ungültige Koordinaten: ${label}`, u);
      return;
    }
    unis.push({ ...u, id: i });
  });

  const countries = new Set(unis.map((u) => u.land).filter(Boolean));
  document.getElementById("summary").textContent =
    `Master Architektur · Auslandssemester · ${unis.length} Partner-Unis in ${countries.size} Ländern`;

  // Länderkürzel (ISO 3166) zu den Ländercodes der Weltkarte; fehlt ein Land
  // hier, werden die ersten zwei Buchstaben aus "land" in unis.js genommen.
  const ISO2 = {
    "040": "AT", "036": "AU", "056": "BE", "076": "BR", "124": "CA", "756": "CH", "152": "CL",
    "156": "CN", "203": "CZ", "276": "DE", "208": "DK", "724": "ES", "246": "FI", "250": "FR",
    "826": "GB", "300": "GR", "348": "HU", "372": "IE", "380": "IT", "392": "JP", "410": "KR",
    "484": "MX", "528": "NL", "578": "NO", "554": "NZ", "616": "PL", "620": "PT", "752": "SE",
    "702": "SG", "792": "TR", "840": "US",
  };

  // ── Karte ──────────────────────────────────────────────
  const svg = d3.select("#map");
  const root = svg.append("g");
  const sphere = root.append("path").attr("class", "map__sphere");
  const graticule = root.append("path").attr("class", "map__graticule");
  const landLayer = root.append("g");
  const pinLayer = svg.append("g");

  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);
  const graticuleData = d3.geoGraticule10();
  let coarse = null; // Länder grob (110m)
  let fine = null; // Länder fein (50m), wird nachgeladen
  let shownDetail = null;
  let width = 0;
  let height = 0;
  let lastWidth = null;
  let transform = d3.zoomIdentity;
  let activeId = null;

  const zoom = d3
    .zoom()
    .scaleExtent([1, 60])
    .on("zoom", (event) => {
      transform = event.transform;
      root.attr("transform", transform);
      scheduleOverlay();
    })
    .on("end", () => {
      root.style("--k", transform.k);
      drawLand();
      placePins(true);
    });
  svg.call(zoom).on("dblclick.zoom", null);

  function layout() {
    const box = svg.node().getBoundingClientRect();
    width = box.width;
    height = box.height;
    const pad = Math.min(width, height) * 0.06;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    projection.fitExtent([[pad, pad], [width - pad, height - pad]], { type: "Sphere" });
    const [[x0, y0], [x1, y1]] = path.bounds({ type: "Sphere" });
    zoom.extent([[0, 0], [width, height]]).translateExtent([[x0 - pad, y0], [x1 + pad, y1]]);
    sphere.attr("d", path({ type: "Sphere" }));
    graticule.attr("d", path(graticuleData));
    shownDetail = null;
    drawLand();
    // Nur bei geänderter Breite neu ausrichten – auf dem Handy ändert sich
    // beim Scrollen der Adressleiste nur die Höhe, da bleibt der Zoom erhalten.
    if (width !== lastWidth) svg.call(zoom.transform, homeTransform());
    else placePins(true);
    lastWidth = width;
  }

  // Startansicht: ganze Welt; auf schmalen Hochformat-Bildschirmen wäre die
  // Welt zu klein, dort startet die Karte auf Europa (die meisten Unis).
  function homeTransform() {
    if (width >= 640 || height < width) return d3.zoomIdentity;
    const [x, y] = projection([12, 50]);
    const k = 4.5;
    const t = d3.zoomIdentity.translate(width / 2 - k * x, height * 0.42 - k * y).scale(k);
    // zoom.transform hält die Verschiebe-Grenzen nicht selbst ein
    return zoom.constrain()(t, zoom.extent()(), zoom.translateExtent());
  }

  // ── Länder ─────────────────────────────────────────────
  // Jedes Land ist ein eigener Pfad: der Browser überspringt beim Zoomen
  // alles, was außerhalb des Ausschnitts liegt.
  const partnerIds = new Set();

  function drawLand() {
    const useFine = fine && transform.k >= FINE_FROM_ZOOM;
    const data = useFine ? fine : coarse;
    if (!data || data === shownDetail) return;
    shownDetail = data;
    landLayer
      .selectAll("path")
      .data(data.features, (f) => f.id)
      .join("path")
      .attr("class", (f) => (partnerIds.has(f.id) ? "map__land map__land--partner" : "map__land"))
      .attr("d", path);
  }

  // Partnerländer bestimmen (das Land, in dem der Pin liegt) und das
  // Länderkürzel in die jeweilige Nadel schreiben
  function setupCountries(features) {
    partnerIds.clear();
    unis.forEach((u) => {
      const f = features.find((c) => d3.geoContains(c, [u.lng, u.lat]));
      if (f) partnerIds.add(f.id);
      u.code = (f && ISO2[f.id]) || String(u.land || "").slice(0, 2).toUpperCase();
    });
    pins.select(".pin__code").text((u) => u.code);
  }

  // Pins höchstens einmal pro Bild neu setzen
  let frame = null;
  function scheduleOverlay() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      placePins(false);
    });
  }

  // ── Pins ───────────────────────────────────────────────
  const pins = pinLayer
    .selectAll("g")
    .data(unis)
    .join("g")
    .attr("class", "pin")
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", (u) => `${u.name}, ${u.stadt}`)
    .on("click", (event, u) => {
      event.stopPropagation();
      openCard(u);
    })
    .on("keydown", (event, u) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard(u);
      }
    });
  pins.append("title").text((u) => `${u.name} – ${u.stadt}`);
  // Pinnadel: Spitze liegt genau auf dem Standort (0,0), Kopf darüber;
  // im Kopf steht das Länderkürzel.
  pins.append("ellipse").attr("class", "pin__shadow").attr("rx", 6).attr("ry", 2.4);
  pins
    .append("path")
    .attr("class", "pin__head")
    .attr("d", "M0 0C-1.8-7.2-13-13.5-13-23A13 13 0 1 1 13-23C13-13.5 1.8-7.2 0 0Z");
  pins.append("circle").attr("class", "pin__eye").attr("cy", -23).attr("r", 9.5);
  pins.append("text").attr("class", "pin__code").attr("y", -23);
  pins.append("rect").attr("x", -16).attr("y", -40).attr("width", 32).attr("height", 44).attr("fill", "transparent");

  // Bildschirmposition jedes Pins; zu dicht liegende Pins (z. B. die zwei
  // Unis in Seoul) werden im Kreis um ihren Mittelpunkt verteilt.
  function placePins(reorder) {
    const points = unis.map((u) => transform.apply(projection([u.lng, u.lat])));
    const clusters = [];
    points.forEach((p, i) => {
      const near = clusters.find((c) => Math.hypot(c.x - p[0], c.y - p[1]) < PIN_GAP);
      if (near) {
        near.members.push(i);
        near.x = d3.mean(near.members, (m) => points[m][0]);
        near.y = d3.mean(near.members, (m) => points[m][1]);
      } else {
        clusters.push({ x: p[0], y: p[1], members: [i] });
      }
    });
    const pos = [];
    clusters.forEach((c) => {
      const n = c.members.length;
      const radius = n === 1 ? 0 : Math.max(16, (n * 32) / (2 * Math.PI));
      c.members.forEach((m, k) => {
        const angle = (2 * Math.PI * k) / n - Math.PI / 2;
        pos[m] = [c.x + radius * Math.cos(angle), c.y + radius * Math.sin(angle)];
      });
    });
    pins.attr("transform", (u, i) => `translate(${pos[i][0]},${pos[i][1]})`);
    // Weiter unten liegende Nadeln überdecken die darüber liegenden
    pins.each((u, i) => (u.screenY = pos[i][1]));
    if (reorder) pins.sort((a, b) => a.screenY - b.screenY);
  }

  // ── Uni-Karte ──────────────────────────────────────────
  const card = document.getElementById("card");
  const cardImg = document.getElementById("card-img");
  const cardName = document.getElementById("card-name");
  const cardFacts = document.getElementById("card-facts");
  const cardLink = document.getElementById("card-link");

  function missing(value) {
    return value === null || value === undefined || value === "";
  }

  function placeholderImage(u) {
    const city = String(u.stadt || "").replace(/[<>&"]/g, "");
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7eeed"/><stop offset="1" stop-color="#c0d6df"/></linearGradient></defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <g fill="none" stroke="#294936" stroke-opacity=".35" stroke-width="1.5">
        <path d="M120 300V150l80-60 80 60v150M280 300V110h120v190M400 300V170l60-40 60 40v130M80 300h480"/>
        <path d="M150 300v-80h40v80M310 140h60M310 170h60M310 200h60M310 230h60M440 300v-60h40v60"/>
      </g>
      <text x="320" y="60" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="36" fill="#294936">${city}</text>
      <text x="320" y="345" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#4f6a5a">Platzhalterbild</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
  }

  function openCard(u) {
    activeId = u.id;
    pins.attr("data-active", (p) => (p.id === activeId ? "" : null));

    cardImg.onerror = () => {
      cardImg.onerror = null;
      cardImg.src = placeholderImage(u);
    };
    cardImg.src = missing(u.bild) ? placeholderImage(u) : u.bild;
    cardImg.alt = missing(u.bild) ? `Platzhalterbild ${u.stadt || ""}` : `Foto ${u.name}`;

    cardName.textContent = missing(u.name) ? "Unbenannte Uni" : u.name;

    const place = [u.stadt, u.land].filter((v) => !missing(v)).join(", ");
    const facts = [
      ["Stadt, Land", place],
      ["Plätze", missing(u.plaetze) ? null : `${u.plaetze} ${u.plaetze === 1 ? "Platz" : "Plätze"}`],
      ["Monate (laut Liste)", missing(u.monate) ? null : `${u.monate} Monate`],
      ["Unterrichtssprache", u.sprache],
      // Mehrere Fristen ("Herbst: … · Frühjahr: …") je auf eine eigene Zeile
      ["Bewerbungsfrist", missing(u.frist) ? null : String(u.frist).split(" · ").join("\n")],
    ];
    cardFacts.replaceChildren(
      ...facts.map(([label, value]) => {
        const row = document.createElement("div");
        row.className = "card__fact";
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        if (missing(value)) {
          dd.textContent = OPEN;
          dd.className = "is-open";
        } else {
          dd.textContent = value;
        }
        row.append(dt, dd);
        return row;
      })
    );

    if (typeof u.link === "string" && /^https?:\/\//i.test(u.link)) {
      const a = document.createElement("a");
      a.className = "card__link";
      a.href = u.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Zur Uni-Website ↗";
      cardLink.replaceChildren(a);
    } else {
      const p = document.createElement("p");
      p.className = "card__nolink";
      p.textContent = `Link ${OPEN}`;
      cardLink.replaceChildren(p);
    }

    card.hidden = false;
    card.scrollTop = 0;
  }

  function closeCard() {
    activeId = null;
    pins.attr("data-active", null);
    card.hidden = true;
  }

  document.getElementById("card-close").addEventListener("click", closeCard);
  svg.on("click", closeCard);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCard();
  });

  // ── Zoom-Knöpfe ────────────────────────────────────────
  document.getElementById("zoom-in").addEventListener("click", () => svg.transition().duration(300).call(zoom.scaleBy, 1.8));
  document.getElementById("zoom-out").addEventListener("click", () => svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.8));
  document.getElementById("zoom-reset").addEventListener("click", () => svg.transition().duration(400).call(zoom.transform, homeTransform()));

  // ── Start ──────────────────────────────────────────────
  layout();
  window.addEventListener("resize", layout);

  function loadWorld(url) {
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  }

  loadWorld(WORLD_COARSE)
    .then((world) => {
      coarse = topojson.feature(world, world.objects.countries);
      setupCountries(coarse.features);
      drawLand();
      // feine Karte im Hintergrund nachladen
      return loadWorld(WORLD_FINE).then((w) => {
        fine = topojson.feature(w, w.objects.countries);
        // mit den genauen Umrissen erkennt man auch Küstenorte (z. B. Bergen) sicher
        setupCountries(fine.features);
        shownDetail = null;
        drawLand();
      });
    })
    .catch((err) => {
      console.error("Weltkarte konnte nicht geladen werden:", err);
      if (!coarse) showStatus("Die Länderumrisse konnten nicht geladen werden. Die Pins funktionieren trotzdem.");
    });
})();
