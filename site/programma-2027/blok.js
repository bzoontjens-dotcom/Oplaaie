/* Het blok voor 2027: de elfde. De tien pullen komen een voor een op tafel, daarna licht de elfde op.
   Zonder dit script, en voor wie animaties heeft uitgezet, staat het beeld er meteen in zijn eindstand. */
(function(){
  'use strict';
  var beeld = document.querySelector('.elfde-beeld');
  if (!beeld || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  beeld.classList.add('wacht');
  var kijk = new IntersectionObserver(function(items){
    items.forEach(function(item){
      if (!item.isIntersecting) return;
      beeld.classList.remove('wacht'); beeld.classList.add('start');
      kijk.disconnect();
    });
  }, { threshold: .45 });
  kijk.observe(beeld);
})();
