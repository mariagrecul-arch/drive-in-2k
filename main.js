/* DRIVE-IN 2K – kleine Ergänzungen. Die Seite funktioniert auch ohne JavaScript. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  /* ---------- Programmseite: Lenkrad-Pfeile blättern durch die Filme ---------- */
  var streifen = document.getElementById("filmstreifen");
  if (streifen) {
    var filme = streifen.children;
    var nummer = document.querySelector("[data-film-nr]");
    var lenkrad = document.querySelector("[data-lenkrad]");
    var aktuell = 0;
    var zeige = function (index) {
      aktuell = (index + filme.length) % filme.length;
      streifen.scrollTo({ left: filme[aktuell].offsetLeft - streifen.offsetLeft, behavior: "smooth" });
      nummer.textContent = String(aktuell + 1);
    };
    var lenken = function (richtung) {
      lenkrad.classList.remove("links", "rechts");
      void lenkrad.offsetWidth;
      lenkrad.classList.add(richtung);
      setTimeout(function () { lenkrad.classList.remove(richtung); }, 380);
    };
    document.querySelectorAll("[data-film]").forEach(function (knopf) {
      knopf.addEventListener("click", function () {
        var vor = knopf.getAttribute("data-film") === "vor";
        lenken(vor ? "rechts" : "links");
        zeige(aktuell + (vor ? 1 : -1));
      });
    });
    streifen.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); lenken("rechts"); zeige(aktuell + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); lenken("links"); zeige(aktuell - 1); }
    });
    var warten;
    streifen.addEventListener("scroll", function () { /* auch Wischen aktualisiert die Nummer */
      clearTimeout(warten);
      warten = setTimeout(function () {
        aktuell = Math.round(streifen.scrollLeft / streifen.clientWidth);
        nummer.textContent = String(aktuell + 1);
      }, 120);
    });
  }

  /* ---------- Countdown bis zur Saisonpremiere ---------- */
  var countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    var ziel = new Date(countdown.getAttribute("data-countdown")).getTime();
    var felder = {
      tage: countdown.querySelector("[data-teil='tage']"),
      stunden: countdown.querySelector("[data-teil='stunden']"),
      minuten: countdown.querySelector("[data-teil='minuten']"),
      sekunden: countdown.querySelector("[data-teil='sekunden']")
    };
    var tick = function () {
      var rest = Math.max(0, ziel - Date.now());
      felder.tage.textContent = Math.floor(rest / 864e5);
      felder.stunden.textContent = String(Math.floor(rest / 36e5) % 24).padStart(2, "0");
      felder.minuten.textContent = String(Math.floor(rest / 6e4) % 60).padStart(2, "0");
      felder.sekunden.textContent = String(Math.floor(rest / 1e3) % 60).padStart(2, "0");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Highlight: Platz wählen und aus dem Auto schauen ---------- */
  var dialog = document.getElementById("sicht-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    var sicht = dialog.querySelector(".sicht");
    var titel = dialog.querySelector("#sicht-titel");
    var text = dialog.querySelector("[data-sicht-text]");
    var buchen = dialog.querySelector("[data-sicht-buchen]");
    var beschreibung = {
      1: "Ganz vorne: Die Leinwand füllt fast die ganze Frontscheibe. Perfekt für Filmfans, die jedes Detail sehen wollen.",
      2: "Die goldene Mitte: Ihr seht die ganze Leinwand ohne den Kopf zu drehen, und die Autos vor euch rahmen das Bild wie im echten Autokino.",
      3: "Hinten mit Überblick: Die Leinwand wirkt kleiner, dafür habt ihr Platz für Klappstühle neben dem Auto – ideal für große Teams."
    };

    document.querySelectorAll(".auto").forEach(function (auto) {
      auto.addEventListener("click", function (ereignis) {
        ereignis.preventDefault();
        var reihe = Number(auto.dataset.reihe);
        var platz = Number(auto.dataset.platz);
        var anzahl = Number(auto.dataset.anzahl);

        /* Zoom startet am angeklickten Auto */
        var box = auto.getBoundingClientRect();
        dialog.style.setProperty("--ox", ((box.left + box.width / 2) / window.innerWidth * 100) + "%");
        dialog.style.setProperty("--oy", ((box.top + box.height / 2) / window.innerHeight * 100) + "%");

        /* Je weiter hinten, desto kleiner die Leinwand; je weiter außen, desto mehr seitlich */
        var zoom = { 1: 1.25, 2: 0.95, 3: 0.72 }[reihe];
        var mitte = (anzahl + 1) / 2;
        var versatz = (mitte - platz) / Math.max(1, anzahl - 1) * 30;
        sicht.dataset.reihe = String(reihe);
        sicht.style.setProperty("--zoom", "0.4");
        sicht.style.setProperty("--versatz", "0%");

        titel.textContent = "Reihe " + reihe + " · Platz " + platz;
        text.textContent = beschreibung[reihe];
        buchen.href = "tickets.html?platz=" + encodeURIComponent("Reihe " + reihe + ", Platz " + platz) + "#anfrage";

        dialog.showModal();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            sicht.style.setProperty("--zoom", String(zoom));
            sicht.style.setProperty("--versatz", versatz + "%");
          });
        });
      });
    });

    dialog.addEventListener("click", function (ereignis) {
      if (ereignis.target === dialog) { dialog.close(); }
    });
    dialog.querySelectorAll("[data-schliessen]").forEach(function (knopf) {
      knopf.addEventListener("click", function () { dialog.close(); });
    });
  }

  /* ---------- Ticketformular: Wunschplatz übernehmen und Danke-Meldung ---------- */
  var formular = document.getElementById("ticket-formular");
  if (formular) {
    var parameter = new URLSearchParams(window.location.search);
    var platzFeld = document.getElementById("wunschplatz");
    if (parameter.get("platz") && platzFeld) {
      platzFeld.value = parameter.get("platz").slice(0, 40);
    }
    formular.addEventListener("submit", function (ereignis) {
      ereignis.preventDefault();
      var danke = document.getElementById("danke");
      var firma = document.getElementById("firma").value.trim();
      danke.querySelector("[data-firma]").textContent = firma || "euer Team";
      danke.classList.add("ist-sichtbar");
      formular.reset();
      danke.setAttribute("tabindex", "-1");
      danke.focus();
    });
  }
})();
