/* Beweging op de website: rapportbladen komen op, cijfers tellen op, balken,
 * streepjes en de tijdlijn lopen vol. Elke keer dat een onderdeel opnieuw in
 * beeld komt, speelt de animatie opnieuw. Zonder JavaScript, of met een
 * voorkeur voor minder beweging, staat alles direct in de eindstand. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('beweeg');

  var nl = function (d) { return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }); };

  // Telt het eerste getal in een kerncijfer op van 0 naar de eindwaarde.
  function telOp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    if (el.dataset.eind === undefined) el.dataset.eind = node.nodeValue;
    var tekst = el.dataset.eind;
    var m = tekst.match(/\d[\d.]*(?:,\d+)?/);
    if (!m) return;
    var decimalen = (m[0].split(',')[1] || '').length;
    var doel = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    var fmt = nl(decimalen), voor = tekst.slice(0, m.index), na = tekst.slice(m.index + m[0].length);
    var beurt = (el._beurt || 0) + 1, start = null, duur = 1100;
    el._beurt = beurt;
    node.nodeValue = voor + fmt.format(0) + na;
    function stap(t) {
      if (el._beurt !== beurt) return; // een nieuwere animatie is begonnen
      if (start === null) start = t;
      var p = Math.min((t - start) / duur, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = p < 1 ? voor + fmt.format(doel * e) + na : tekst;
      if (p < 1) requestAnimationFrame(stap);
    }
    setTimeout(function () { requestAnimationFrame(stap); }, 200);
  }

  function terug(el) {
    el.querySelectorAll('.r-figure, .stat__getal').forEach(function (f) {
      f._beurt = (f._beurt || 0) + 1;
      if (f.dataset.eind !== undefined && f.firstChild) f.firstChild.nodeValue = f.dataset.eind;
    });
  }

  var io = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      var el = item.target;
      if (item.isIntersecting && item.intersectionRatio >= 0.15) {
        if (el.classList.contains('is-in')) return;
        el.classList.add('is-in');
        if (el.classList.contains('r-sheet')) el.querySelectorAll('.r-figure').forEach(telOp);
        if (el.classList.contains('stat')) el.querySelectorAll('.stat__getal').forEach(telOp);
      } else if (!item.isIntersecting) {
        // Helemaal uit beeld: terug naar de beginstand, zodat het opnieuw speelt.
        el.classList.remove('is-in');
        terug(el);
      }
    });
  }, { threshold: [0, 0.15] });

  document.querySelectorAll('.r-sheet, .reveal, .streepjes, .timeline').forEach(function (el) { io.observe(el); });

  // Bij afdrukken alle cijfers op hun eindwaarde zetten.
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.r-figure, .stat__getal').forEach(function (f) {
      f._beurt = (f._beurt || 0) + 1;
      if (f.dataset.eind !== undefined && f.firstChild) f.firstChild.nodeValue = f.dataset.eind;
    });
  });

  // Een dia die opnieuw zichtbaar wordt, speelt zijn animatie opnieuw af.
  window.easybySpeelOpnieuw = function (dia) {
    dia.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('is-in');
      terug(el);
      void el.offsetWidth;
      el.classList.add('is-in');
      el.querySelectorAll('.stat__getal').forEach(telOp);
    });
  };
})();

/* Carrousel "Wist je dat?": wisselt automatisch van dia, pauzeert bij muis of
 * toetsenbordfocus en met de pauzeknop. Bij een voorkeur voor minder beweging
 * loopt hij niet vanzelf; de streepjes werken altijd. */
(function () {
  document.querySelectorAll('.carrousel').forEach(function (c) {
    var dias = c.querySelectorAll('.carrousel__dia');
    var stippen = c.querySelectorAll('.carrousel__stip');
    var knop = c.querySelector('.carrousel__pauze');
    if (dias.length < 2) return;
    var interval = parseInt(c.dataset.interval, 10) || 8000;
    var rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var huidig = 0, timer = null, gepauzeerd = rustig, zweeft = false;
    c.style.setProperty('--carrousel-interval', interval + 'ms');
    c.classList.add('carrousel--actief');

    function toon(i) {
      huidig = (i + dias.length) % dias.length;
      dias.forEach(function (d, n) {
        var aan = n === huidig;
        d.classList.toggle('is-actief', aan);
        d.setAttribute('aria-hidden', aan ? 'false' : 'true');
        d.inert = !aan;
      });
      stippen.forEach(function (s, n) {
        s.classList.toggle('is-actief', n === huidig);
        if (n === huidig) s.setAttribute('aria-current', 'true'); else s.removeAttribute('aria-current');
      });
      if (window.easybySpeelOpnieuw) window.easybySpeelOpnieuw(dias[huidig]);
      plan();
    }
    function plan() {
      clearTimeout(timer);
      var loopt = !gepauzeerd && !zweeft;
      c.classList.toggle('carrousel--loopt', !rustig && !gepauzeerd);
      c.classList.toggle('carrousel--gepauzeerd', gepauzeerd || zweeft);
      if (loopt) {
        // Timer en voortgangsbalk beginnen samen opnieuw.
        var balk = stippen[huidig].querySelector('span');
        balk.style.animation = 'none'; void balk.offsetWidth; balk.style.animation = '';
        timer = setTimeout(function () { toon(huidig + 1); }, interval);
      }
    }
    stippen.forEach(function (s, n) { s.addEventListener('click', function () { toon(n); }); });
    knop.addEventListener('click', function () {
      gepauzeerd = !gepauzeerd;
      knop.setAttribute('aria-label', gepauzeerd ? 'Speel de carrousel af' : 'Pauzeer de carrousel');
      plan();
    });
    // Bij muis of focus pauzeren; de voortgangsbalk blijft dan staan.
    c.addEventListener('mouseenter', function () { zweeft = true; plan(); });
    c.addEventListener('mouseleave', function () { zweeft = false; plan(); });
    c.addEventListener('focusin', function () { zweeft = true; plan(); });
    c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) { zweeft = false; plan(); } });
    // Niet doorlopen als de carrousel niet in beeld is.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (items) {
        items.forEach(function (it) { zweeft = !it.isIntersecting ? true : (c.matches(':hover') || c.contains(document.activeElement)); plan(); });
      }, { threshold: 0.3 }).observe(c);
    }
    if (rustig) knop.setAttribute('aria-label', 'Speel de carrousel af');
    toon(0);
  });
})();

/* Menu op mobiel: sluit bij Escape, bij een klik op een link en bij een klik
 * ernaast. Zonder JavaScript werkt het menu ook (details/summary). */
(function () {
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var knop = menu.querySelector('.menu__knop');
  function sluit() { menu.removeAttribute('open'); }
  menu.addEventListener('toggle', function () { knop.setAttribute('aria-label', menu.open ? 'Menu sluiten' : 'Menu openen'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { sluit(); knop.focus(); } });
  document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) sluit(); });
  menu.querySelectorAll('.menu__paneel a').forEach(function (a) { a.addEventListener('click', sluit); });
})();

/* Vaste knop onderin (mobiel): verschijnt zodra het eerste scherm uit beeld is,
 * en verdwijnt als de slotbalk of de footer met dezelfde knop in beeld komt. */
(function () {
  var balk = document.querySelector('[data-sticky]');
  var eerste = document.querySelector('main > section');
  if (!balk || !eerste || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('heeft-sticky-cta');
  var voorbijEerste = false, eindeInBeeld = false;
  function update() { balk.classList.toggle('is-zichtbaar', voorbijEerste && !eindeInBeeld); }
  new IntersectionObserver(function (items) { voorbijEerste = !items[0].isIntersecting; update(); }).observe(eerste);
  var einde = document.querySelector('.band, footer');
  if (einde) new IntersectionObserver(function (items) { eindeInBeeld = items[0].isIntersecting; update(); }).observe(einde);
})();

/* Meting zonder cookies (GoatCounter). Staat pas aan als in de pagina
 * <meta name="goatcounter" content="naam"> is ingevuld. Telt paginabezoeken en,
 * als gebeurtenis, aanvragen van de mini-scan en klikken op mail en telefoon. */
(function () {
  var meta = document.querySelector('meta[name="goatcounter"]');
  var naam = meta && meta.content.trim();
  if (!naam || !/^[a-z0-9-]+$/.test(naam)) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + naam + '.goatcounter.com/count');
  document.head.appendChild(s);
  function tel(pad, titel) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: pad, title: titel, event: true });
  }
  var form = document.getElementById('mini-scan-form');
  if (form) form.addEventListener('submit', function () { if (form.checkValidity()) tel('mini-scan-aanvraag', 'Mini-scan aangevraagd'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"], a[href^="tel:"]');
    if (!a) return;
    var soort = a.getAttribute('href').indexOf('tel:') === 0 ? 'bellen' : 'mailen';
    tel('klik-' + soort, 'Klik: ' + soort + ' (' + location.pathname + ')');
  });
})();
