(function () {
  var MAX_COMETS = 2; // simultaneous
  var MIN_INTERVAL_MS = 7000;
  var MAX_INTERVAL_MS = 16000;
  var activeComets = 0;
  var visibilityHidden = false;

  function ensureContainer() {
    var container = document.querySelector('.comets');
    if (!container) {
      container = document.createElement('div');
      container.className = 'comets';
      document.body.appendChild(container);
    }
    return container;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function spawnComet() {
    if (visibilityHidden) return;
    if (activeComets >= MAX_COMETS) return;

    var container = ensureContainer();

    // Randomize path start/end
    var fromLeft = Math.random() < 0.7;
    var startYvh = rand(10, 85);
    var angleDeg = fromLeft ? rand(-35, -15) : rand(15, 35);
    var durationMs = rand(2400, 4200);
    var sizePx = rand(2.2, 3.6);

    // Convert to pixels for precise positioning
    var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    var x0 = fromLeft ? -0.1 * vw : 1.1 * vw;
    var y0 = (startYvh / 100) * vh;

    var dx = (fromLeft ? rand(1.15, 1.45) : rand(-1.45, -1.15)) * vw;
    var dy = (fromLeft ? rand(-0.55, -0.25) : rand(0.25, 0.55)) * vh;

    // Create DOM structure
    var comet = document.createElement('div');
    comet.className = 'comet';
    comet.style.left = x0 + 'px';
    comet.style.top = y0 + 'px';

    var trail = document.createElement('div');
    trail.className = 'comet-trail';

    var head = document.createElement('div');
    head.className = 'comet-head';
    head.style.setProperty('--size', sizePx.toFixed(1) + 'px');

    comet.appendChild(trail);
    comet.appendChild(head);
    container.appendChild(comet);

    activeComets += 1;

    var startTime = null;
    var angleRad = Math.atan2(dy, dx);
    var angle = angleDeg; // visual tilt for head glow; we still rotate trail by true angle

    function step(ts) {
      if (!startTime) startTime = ts;
      var t = clamp01((ts - startTime) / durationMs);

      // position along path
      var cx = dx * t;
      var cy = dy * t;

      // move head relative to start point
      head.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) rotate(' + angle + 'deg)';

      // grow and rotate trail from start to current head position
      var dist = Math.sqrt(cx * cx + cy * cy);
      trail.style.width = dist.toFixed(1) + 'px';
      trail.style.transform = 'translateY(-50%) rotate(' + (angleRad * 180 / Math.PI).toFixed(2) + 'deg)';

      // opacity easing
      var fadeIn = Math.min(1, t / 0.08);
      var fadeOut = Math.min(1, (1 - t) / 0.08);
      var alpha = Math.min(fadeIn, fadeOut);
      head.style.opacity = alpha.toFixed(3);
      trail.style.opacity = Math.min(0.95, alpha + 0.25).toFixed(3);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // cleanup
        activeComets = Math.max(0, activeComets - 1);
        if (comet && comet.parentNode) comet.parentNode.removeChild(comet);
      }
    }

    requestAnimationFrame(step);
  }

  function scheduleNext() {
    var delay = rand(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    window.setTimeout(function () {
      if (!visibilityHidden) spawnComet();
      scheduleNext();
    }, delay);
  }

  function onVisibilityChange() {
    visibilityHidden = document.hidden;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ensureContainer();
      spawnComet();
      scheduleNext();
    });
  } else {
    ensureContainer();
    spawnComet();
    scheduleNext();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
})();


