/* Beweging op de website: rapportbladen komen op, cijfers tellen op, balken
 * en het groene streepje lopen vol. Zonder JavaScript, of met een voorkeur
 * voor minder beweging, staat alles direct in de eindstand. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('beweeg');

  var nl = function (d) { return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }); };

  function telOp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var tekst = node.nodeValue;
    var m = tekst.match(/\d[\d.]*(?:,\d+)?/);
    if (!m) return;
    var decimalen = (m[0].split(',')[1] || '').length;
    var doel = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    var fmt = nl(decimalen), voor = tekst.slice(0, m.index), na = tekst.slice(m.index + m[0].length);
    var start = null, duur = 1100;
    node.nodeValue = voor + fmt.format(0) + na;
    function stap(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duur, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = voor + fmt.format(doel * e) + na;
      if (p < 1) requestAnimationFrame(stap);
    }
    setTimeout(function () { requestAnimationFrame(stap); }, 200);
  }

  var io = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (!item.isIntersecting) return;
      var el = item.target;
      el.classList.add('is-in');
      if (el.classList.contains('r-sheet')) el.querySelectorAll('.r-figure').forEach(telOp);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.r-sheet, .reveal, .streepjes').forEach(function (el) { io.observe(el); });
})();
