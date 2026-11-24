/* Het blok "x Oplaaie mee Hans": de laaiklep, de confetti, de kaart met dertig adressen
   en de route van de avond. Dit script hoort bij het blok en doet niets daarbuiten. */
(function(){
  'use strict';
  var $ = function(s){ return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- confetti ---------- */
  var cv = $('#confetti'), ctx = cv.getContext('2d'), P = [], running = false;
  var KLEUREN = ['#C81E16', '#FFD84D', '#FFFEFA', '#1F4FD1', '#2BB673', '#FF6A13'];
  function maat(){ var r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
  maat(); addEventListener('resize', maat);
  function strooi(el, n){
    if (reduce) return;
    var b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height * .5;
    for (var i = 0; i < n; i++) P.push({ x: x + (Math.random() - .5) * 80, y: y, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, r: 5 + Math.random() * 7, c: KLEUREN[i % KLEUREN.length], a: Math.random() * 6, s: (Math.random() - .5) * .35, t: i % 3, life: 150 + Math.random() * 60 });
    if (!running) { running = true; requestAnimationFrame(teken); }
  }
  function teken(){
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    P = P.filter(function(p){ return p.life > 0 && p.y < innerHeight + 40; });
    P.forEach(function(p){
      p.x += p.vx; p.y += p.vy; p.vy += .32; p.vx *= .985; p.a += p.s; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c;
      if (p.t === 0) ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
      else if (p.t === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 7); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(0, -p.r * .7); ctx.lineTo(p.r * .7, p.r * .6); ctx.lineTo(-p.r * .7, p.r * .6); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    });
    if (P.length) requestAnimationFrame(teken); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------- de laaiklep: tik om hem open en dicht te doen ---------- */
  /* De klep is een gewone knop. Daardoor werkt hij ook met het toetsenbord en
     kun je op een telefoon gewoon over de wagen heen scrollen. */
  var truck = $('#truck'), klep = $('#klep'), hint = $('#hint'), isOpen = false, tm = [];
  var muis = matchMedia('(hover: hover)').matches;
  function tekstHint(open){ return open ? (muis ? 'Klik nog een keer om hem dicht te doen' : 'Tik nog een keer om hem dicht te doen') : (muis ? 'Klik op de laaiklep' : 'Tik op de laaiklep'); }
  function setOpen(v){
    isOpen = v; tm.forEach(clearTimeout); tm = [];
    truck.classList.toggle('open', v);
    klep.setAttribute('aria-pressed', v ? 'true' : 'false');
    klep.setAttribute('aria-label', v ? 'Doe de laaiklep dicht' : 'Doe de laaiklep open');
    hint.textContent = tekstHint(v);
    if (v) {
      truck.classList.add('blink', 'reverse');
      tm.push(setTimeout(function(){ truck.classList.add('lit'); }, reduce ? 0 : 1250));
      tm.push(setTimeout(function(){ truck.classList.remove('reverse'); strooi($('.portal'), 170); }, reduce ? 0 : 1500));
      tm.push(setTimeout(function(){ truck.classList.remove('blink'); }, reduce ? 0 : 2800));
    } else truck.classList.remove('lit', 'reverse', 'blink');
  }
  klep.addEventListener('click', function(){ setOpen(!isOpen); });
  hint.textContent = tekstHint(false);
  $('#aftel').textContent = Math.max(0, Math.ceil((Date.UTC(2027, 1, 4, 15, 0, 0) - Date.now()) / 864e5));

  /* De wagen rijdt het beeld in zodra hij voor het eerst in beeld komt, één keer per bezoek. */
  var gereden = false; try { gereden = sessionStorage.getItem('oplaaie-gereden') === '1'; } catch (e) {}
  function rijdBinnen(){
    if (gereden || reduce) return; gereden = true;
    try { sessionStorage.setItem('oplaaie-gereden', '1'); } catch (e) {}
    truck.classList.add('rijdt');
    setTimeout(function(){ truck.classList.add('rem'); }, 1300);
    setTimeout(function(){ truck.classList.remove('rijdt'); }, 2000);
    setTimeout(function(){ truck.classList.remove('rem'); }, 2100);
  }
  if ('IntersectionObserver' in window) {
    var wo = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { rijdBinnen(); wo.disconnect(); } }); }, { threshold: .25 });
    wo.observe(truck);
  }

  /* kaart: dertig adressen gaan naar de tent */
  var map = $('#map'), mc = map.getContext('2d'), MW = 0, MH = 0, dots = [], streets = [], mstate = 'idle', mt0 = 0, mdone = 0;
  var TENT = { x: .57, y: .5 };
  var seed = 1111; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  (function(){
    var areas = [[.46, .16, .12], [.2, .35, .11], [.22, .73, .12], [.6, .83, .11], [.85, .5, .09], [.76, .2, .1], [.34, .56, .07]];
    for (var i = 0; i < 30; i++) { var a = areas[i % areas.length], g = rnd() * 6.283, r = Math.sqrt(rnd()) * a[2]; dots.push({ x: a[0] + Math.cos(g) * r, y: a[1] + Math.sin(g) * r, d: i * 70 + rnd() * 240, k: (rnd() - .5) * .6 }); }
    for (var j = 0; j < 70; j++) { var x = rnd(), y = rnd(), ang = rnd() * 3.14, l = .05 + rnd() * .12; streets.push([x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l]); }
  })();
  var ring = []; for (var i = 0; i < 24; i++) { var a = i / 24 * 6.283, rr = .19 + .025 * Math.sin(a * 3) + .015 * Math.cos(a * 5); ring.push([.5 + Math.cos(a) * rr * 1.08, .5 + Math.sin(a) * rr]); }
  var roads = [[[.5, .31], [.47, .12], [.44, 0]], [[.31, .45], [.15, .4], [0, .37]], [[.36, .63], [.2, .8], [.08, 1]], [[.55, .69], [.58, .86], [.6, 1]], [[.7, .5], [.86, .52], [1, .5]], [[.64, .35], [.8, .18], [.94, 0]]];
  var dommel = [[.43, 1], [.5, .82], [.62, .66], [.63, .52], [.58, .4], [.62, .25], [.56, .1], [.6, 0]];
  var labels = [['Woensel', .42, .08], ['Strijp', .1, .28], ['Gestel', .12, .62], ['Stratum', .66, .93], ['Tongelre', .84, .64], ['Centrum', .42, .44]];
  function sizeMap(){ var w = map.clientWidth || 500, r = devicePixelRatio || 1; MW = w; MH = Math.round(w * .86); map.style.height = MH + 'px'; map.width = w * r; map.height = MH * r; mc.setTransform(r, 0, 0, r, 0, 0); drawMap(performance.now()); }
  function X(x){ return x * MW; } function Y(y){ return y * MH; }
  function smooth(pts){ mc.beginPath(); mc.moveTo(X(pts[0][0]), Y(pts[0][1])); for (var i = 1; i < pts.length - 1; i++) { var xc = (X(pts[i][0]) + X(pts[i + 1][0])) / 2, yc = (Y(pts[i][1]) + Y(pts[i + 1][1])) / 2; mc.quadraticCurveTo(X(pts[i][0]), Y(pts[i][1]), xc, yc); } var l = pts[pts.length - 1]; mc.lineTo(X(l[0]), Y(l[1])); }
  function ease(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function drawMap(now){
    mc.clearRect(0, 0, MW, MH); mc.fillStyle = '#FFFEFA'; mc.fillRect(0, 0, MW, MH);
    mc.strokeStyle = '#EFE6D4'; mc.lineWidth = 1.5; streets.forEach(function(s){ mc.beginPath(); mc.moveTo(X(s[0]), Y(s[1])); mc.lineTo(X(s[2]), Y(s[3])); mc.stroke(); });
    mc.lineCap = 'round'; mc.lineJoin = 'round';
    roads.forEach(function(r){ smooth(r); mc.strokeStyle = '#E6D9C0'; mc.lineWidth = 8; mc.stroke(); mc.strokeStyle = '#C9B899'; mc.lineWidth = 2; mc.stroke(); });
    smooth(dommel); mc.strokeStyle = 'rgba(31,79,209,.5)'; mc.lineWidth = 6; mc.stroke();
    var rg = ring.concat([ring[0], ring[1]]); smooth(rg); mc.strokeStyle = '#E6D9C0'; mc.lineWidth = 12; mc.stroke(); mc.strokeStyle = '#B9A684'; mc.lineWidth = 2.5; mc.stroke();
    mc.font = '700 ' + Math.max(18, MW * .04) + 'px Caveat, "Segoe Print", cursive'; mc.fillStyle = '#7A6A54'; mc.textAlign = 'left';
    labels.forEach(function(l){ mc.fillText(l[0], X(l[1]), Y(l[2])); });
    mc.fillStyle = '#1F4FD1'; mc.fillText('Dommel', X(.64), Y(.12));
    mc.fillStyle = '#7A6A54'; mc.fillText('Ring', X(.72), Y(.33));
    var arrived = 0, t = now - mt0;
    dots.forEach(function(d){
      var p = 0;
      if (mstate === 'run') p = Math.max(0, Math.min(1, (t - d.d) / 1300)); else if (mstate === 'done') p = 1;
      if (p >= 1) { arrived++; return; }
      var e = ease(p), cx = (d.x + TENT.x) / 2 + (TENT.y - d.y) * d.k, cy = (d.y + TENT.y) / 2 - (TENT.x - d.x) * d.k;
      var x = (1 - e) * (1 - e) * d.x + 2 * (1 - e) * e * cx + e * e * TENT.x, y = (1 - e) * (1 - e) * d.y + 2 * (1 - e) * e * cy + e * e * TENT.y;
      if (p > 0) { var e2 = ease(Math.max(0, p - .08)), x2 = (1 - e2) * (1 - e2) * d.x + 2 * (1 - e2) * e2 * cx + e2 * e2 * TENT.x, y2 = (1 - e2) * (1 - e2) * d.y + 2 * (1 - e2) * e2 * cy + e2 * e2 * TENT.y; mc.strokeStyle = 'rgba(200,30,22,.3)'; mc.lineWidth = 3; mc.beginPath(); mc.moveTo(X(x2), Y(y2)); mc.lineTo(X(x), Y(y)); mc.stroke(); }
      mc.beginPath(); mc.arc(X(x), Y(y), Math.max(4, MW * .011), 0, 6.283); mc.fillStyle = '#C81E16'; mc.fill(); mc.lineWidth = 2; mc.strokeStyle = '#2B2118'; mc.stroke();
    });
    // de tent op het Stadhuisplein
    var tx = X(TENT.x), ty = Y(TENT.y), s = Math.max(16, MW * .045), full = arrived / 30;
    if (full > 0) { var g = mc.createRadialGradient(tx, ty, 2, tx, ty, s * (2 + full * 2.5)); g.addColorStop(0, 'rgba(255,216,77,' + (.35 + full * .5) + ')'); g.addColorStop(1, 'rgba(255,216,77,0)'); mc.fillStyle = g; mc.beginPath(); mc.arc(tx, ty, s * (2 + full * 2.5), 0, 6.283); mc.fill(); }
    mc.beginPath(); mc.moveTo(tx - s, ty + s * .55); mc.lineTo(tx, ty - s * .75); mc.lineTo(tx + s, ty + s * .55); mc.closePath(); mc.fillStyle = '#FFFFFF'; mc.fill();
    mc.save(); mc.clip(); mc.fillStyle = '#C81E16'; for (var k = -3; k < 4; k += 2) mc.fillRect(tx + k * s * .25, ty - s, s * .25, s * 2); mc.restore();
    mc.lineWidth = 2.5; mc.strokeStyle = '#2B2118'; mc.beginPath(); mc.moveTo(tx - s, ty + s * .55); mc.lineTo(tx, ty - s * .75); mc.lineTo(tx + s, ty + s * .55); mc.closePath(); mc.stroke();
    mc.font = '700 ' + Math.max(20, MW * .046) + 'px Caveat, "Segoe Print", cursive'; mc.fillStyle = '#2B2118'; mc.textAlign = 'center'; mc.fillText('Bavaria Bierhal', tx, ty + s * 1.5);
    if (arrived !== mdone) { mdone = arrived; $('#mapCount').textContent = arrived; }
    if (mstate === 'run') { if (arrived >= 30) { mstate = 'done'; $('#mapGo').textContent = 'Nog een keer'; } else requestAnimationFrame(drawMap); }
  }
  function startMap(){ if (reduce) { mstate = 'done'; drawMap(performance.now()); $('#mapGo').textContent = 'Nog een keer'; return; } mstate = 'run'; mt0 = performance.now(); mdone = -1; requestAnimationFrame(drawMap); }
  $('#mapGo').addEventListener('click', function(){ if (mstate === 'run') return; mstate = 'idle'; drawMap(performance.now()); setTimeout(startMap, 250); });
  sizeMap(); addEventListener('resize', sizeMap);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ drawMap(performance.now()); });
  if ('IntersectionObserver' in window && !reduce) {
    var mo = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting && mstate === 'idle') { setTimeout(startMap, 500); mo.disconnect(); } }); }, { threshold: .55 });
    mo.observe(map);
  }

  /* ---------- de route van de avond: het wagentje rijdt mee met het scrollen ---------- */
  var routeEl = $('#route'), weg = $('.weg'), wagentje = $('#wagentje'), haltes = [].slice.call(document.querySelectorAll('.halte'));
  function route(){
    var r = routeEl.getBoundingClientRect(), wr = weg.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (innerHeight * .72 - r.top) / Math.max(1, r.height)));
    if (innerWidth > 760) {
      var x = p * (wr.width - 122); wagentje.style.setProperty('--x', x + 'px');
      haltes.forEach(function(h){ var b = h.getBoundingClientRect(); h.classList.toggle('aan', b.left + b.width / 2 - wr.left < x + 100); });
    } else {
      var y = p * (wr.height - 80); wagentje.style.setProperty('--y', y + 'px');
      haltes.forEach(function(h){ var b = h.getBoundingClientRect(); h.classList.toggle('aan', b.top + 30 - wr.top < y + 60); });
    }
  }
  var routeBezig = false;
  addEventListener('scroll', function(){ if (!routeBezig) { routeBezig = true; requestAnimationFrame(function(){ routeBezig = false; route(); }); } }, { passive: true });
  addEventListener('resize', route); route();

})();
