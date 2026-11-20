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
    el.querySelectorAll('.r-figure').forEach(function (f) {
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
      } else if (!item.isIntersecting) {
        // Helemaal uit beeld: terug naar de beginstand, zodat het opnieuw speelt.
        el.classList.remove('is-in');
        terug(el);
      }
    });
  }, { threshold: [0, 0.15] });

  document.querySelectorAll('.r-sheet, .reveal, .streepjes, .timeline').forEach(function (el) { io.observe(el); });
})();
