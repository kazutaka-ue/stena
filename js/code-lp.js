/* code-lp.js - STENA LP behaviors (extracted from preview.html) */

document.addEventListener('DOMContentLoaded', function() {
  const fixCta = document.getElementById('fixCta');
  if(!fixCta) return;

  const introEnd = document.body.classList.contains('preview2')
    ? document.getElementById('methodCompare')
    : null;
  const showStartPosition = () => introEnd
    ? introEnd.getBoundingClientRect().bottom + window.scrollY
    : 1800;
  let isVisible = false;
  let hideTimer = null;

  function showFixCta() {
    if(isVisible) return;
    clearTimeout(hideTimer);

    fixCta.style.display = 'block';
    fixCta.style.opacity = '0';
    fixCta.offsetHeight;

    fixCta.style.opacity = '1';
    isVisible = true;
  }

  function hideFixCta() {
    if(!isVisible && fixCta.style.display === 'none') return;
    clearTimeout(hideTimer);

    fixCta.style.opacity = '0';
    isVisible = false;

    hideTimer = setTimeout(() => {
      if(!isVisible){
        fixCta.style.display = 'none';
      }
    }, 500);
  }

  function handleScroll() {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;

    if(scrollTop < showStartPosition() || isNearBottom){
      hideFixCta();
    } else {
      showFixCta();
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

/* セクション共通ユーティリティ（リビール・スクロール） */
window.LP = (() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

  function bindScroll(fn){
    let last = 0;
    function onScroll(source){
      // iOS Safari はスクロール中に rAF を遅延するため、同期実行する
      const now = performance.now();
      if(source !== 'poll' && now - last < 8) return;
      if(source === 'poll' && now - last < 50) return;
      last = now;
      fn();
    }
    window.addEventListener('scroll', () => onScroll('scroll'), { passive: true });
    window.addEventListener('touchmove', () => onScroll('touchmove'), { passive: true });
    window.addEventListener('resize', () => onScroll('resize'), { passive: true });
    if(window.visualViewport){
      window.visualViewport.addEventListener('scroll', () => onScroll('vv-scroll'), { passive: true });
      window.visualViewport.addEventListener('resize', () => onScroll('vv-resize'), { passive: true });
    }
    setInterval(() => onScroll('poll'), 100);
    onScroll('init');
  }

  /* 画面内入場検知。IO + scroll/touch/poll（スマホの取りこぼし対策） */
  function whenVisible(el, onEnter, options = {}){
    if(!el || typeof onEnter !== 'function') return () => {};

    const rootMargin = options.rootMargin || '0px 0px -12% 0px';
    const once = options.once !== false;
    const onLeave = typeof options.onLeave === 'function' ? options.onLeave : null;
    let alive = true;
    let wasIn = false;
    let enteredOnce = false;
    let io = null;
    let pollId = 0;

    const inViewRect = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 40 && r.top < vh - 40;
    };

    const teardown = () => {
      if(!alive) return;
      alive = false;
      if(io) io.disconnect();
      io = null;
      window.removeEventListener('scroll', onScrollFallback);
      window.removeEventListener('touchmove', onScrollFallback);
      if(pollId) clearInterval(pollId);
      pollId = 0;
    };

    const setIn = (hit) => {
      if(!alive) return;
      if(hit){
        if(wasIn) return;
        wasIn = true;
        if(once && enteredOnce) return;
        enteredOnce = true;
        onEnter();
        if(once && !onLeave) teardown();
        return;
      }
      if(!wasIn) return;
      wasIn = false;
      if(onLeave) onLeave();
      if(once && enteredOnce) teardown();
    };

    const onScrollFallback = () => {
      if(!alive) return;
      setIn(inViewRect());
    };

    if('IntersectionObserver' in window){
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if(entry.target !== el) return;
          setIn(entry.isIntersecting);
        });
      }, { threshold: 0, rootMargin });
      io.observe(el);
    }

    window.addEventListener('scroll', onScrollFallback, { passive: true });
    window.addEventListener('touchmove', onScrollFallback, { passive: true });
    pollId = setInterval(onScrollFallback, 200);
    onScrollFallback();

    return teardown;
  }

  function initRevealInView(selector, options = {}){
    const els = [...document.querySelectorAll(selector)];
    if(!els.length) return;
    /* reduceMotion でも fadeInUp は実行する */

    const pending = new Set(els);
    const show = (el) => {
      if(!pending.has(el)) return;
      pending.delete(el);
      const delay = Number(el.dataset.revealDelay) || 0;
      setTimeout(() => el.classList.add('is-shown'), delay);
    };

    const inView = (el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 40 && r.top < vh - 40;
    };

    /* WebKit: opacity:0 要素の IO が欠落するため、不透明な親を監視 */
    const groups = new Map();
    els.forEach(el => {
      const root = el.closest('section') || el.parentElement;
      if(!groups.has(root)) groups.set(root, []);
      groups.get(root).push(el);
    });

    const parentIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        (groups.get(entry.target) || []).forEach(el => show(el));
        parentIO.unobserve(entry.target);
      });
    }, {
      threshold: 0,
      rootMargin: options.rootMargin || '0px 0px -12% 0px'
    });
    groups.forEach((_, root) => parentIO.observe(root));

    const onScrollFallback = () => {
      if(!pending.size) return;
      pending.forEach(el => {
        if(!inView(el)) return;
        show(el);
      });
    };
    window.addEventListener('scroll', onScrollFallback, { passive: true });
    window.addEventListener('touchmove', onScrollFallback, { passive: true });
    const pollId = setInterval(() => {
      if(!pending.size){
        clearInterval(pollId);
        return;
      }
      onScrollFallback();
    }, 200);
    onScrollFallback();
  }

  initRevealInView('.reveal');

  /* 画像拡大モーダル：data-lp-modal-src を付けた要素から呼び出し可 */
  (() => {
    const dialog = document.getElementById('lpModal');
    const img = document.getElementById('lpModalImg');
    if(!dialog || !img || typeof dialog.showModal !== 'function'){
      return;
    }

    let lastFocus = null;

    function open({ src, alt = '' } = {}){
      if(!src) return;
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt;
      if(!dialog.open) dialog.showModal();
      document.body.classList.add('lp-modal-open');
      const closeBtn = dialog.querySelector('[data-lp-modal-close]');
      if(closeBtn) closeBtn.focus();
    }

    function close(){
      if(dialog.open) dialog.close();
    }

    function onClosed(){
      document.body.classList.remove('lp-modal-open');
      img.removeAttribute('src');
      img.alt = '';
      if(lastFocus && typeof lastFocus.focus === 'function'){
        lastFocus.focus();
      }
      lastFocus = null;
    }

    dialog.addEventListener('close', onClosed);
    dialog.addEventListener('click', (e) => {
      const panel = dialog.querySelector('.lp-modal__panel');
      if(e.target === dialog || e.target === panel) close();
    });
    dialog.querySelectorAll('[data-lp-modal-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
      });
    });
    img.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lp-modal-src]');
      if(!trigger) return;
      e.preventDefault();
      const nested = trigger.querySelector('img');
      open({
        src: trigger.getAttribute('data-lp-modal-src') || (nested && (nested.currentSrc || nested.src)) || '',
        alt: trigger.getAttribute('data-lp-modal-alt') || (nested && nested.alt) || ''
      });
    });
  })();

  return { reduceMotion, clamp, bindScroll, whenVisible };
})();
if (window.__lpJsWatchdog) clearTimeout(window.__lpJsWatchdog);

(() => {
  if(!window.LP || !window.LP.whenVisible) return;

  document.querySelectorAll('#steamBeyondVideo, #steamModesVideo, #storyClosingVideo').forEach((video) => {
    const host = video.closest('.steam-beyond__video, .steam-modes__video, .story-closing__video') || video;
    let shouldPlay = false;

    const tryPlay = () => {
      if(!shouldPlay) return;
      const go = () => {
        if(!shouldPlay) return;
        const p = video.play();
        if(p && p.catch) p.catch(() => {});
      };
      if(video.readyState >= 2) go();
      else video.addEventListener('loadeddata', go, { once: true });
    };

    /* 比較・モード動画はコンテンツのため、iOS「視覚効果を減らす」でも再生する */
    if(window.LP.reduceMotion){
      video.removeAttribute('autoplay');
    }

    window.LP.whenVisible(host, () => {
      shouldPlay = true;
      tryPlay();
    }, {
      once: false,
      onLeave(){
        shouldPlay = false;
        video.pause();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if(document.hidden || !shouldPlay) return;
      tryPlay();
    });
  });
})();

(() => {
  const figure = document.querySelector('#steamCost .steam-cost__figure');
  const num = figure && figure.querySelector('.steam-cost__num');
  if(!figure || !num) return;

  const target = parseInt(num.getAttribute('data-to'), 10);
  if(!Number.isFinite(target)) return;

  const reduceMotion = window.LP && window.LP.reduceMotion;
  if(reduceMotion){
    num.textContent = String(target);
    return;
  }

  const DUR = 900;
  let started = false;

  function animate(){
    if(started) return;
    started = true;
    num.textContent = '0';
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(target * eased));
      if(p < 1) requestAnimationFrame(tick);
      else num.textContent = String(target);
    };
    requestAnimationFrame(tick);
  }

  if(window.LP && window.LP.whenVisible){
    window.LP.whenVisible(figure, animate);
  } else {
    animate();
  }
})();

(() => {
  const video = document.getElementById('tankHeroVisual');
  if(!video) return;

  let played = false;

  function playOnce(){
    if(played) return;
    played = true;
    video.currentTime = 0;
    const p = video.play();
    if(p && p.catch) p.catch(() => {});
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting || played) return;
      playOnce();
      io.unobserve(video);
    });
  }, {
    threshold: 0.35,
    rootMargin: '0px 0px -8% 0px'
  });

  io.observe(video);

  /* 初回表示時すでに画面内なら即再生 */
  const r = video.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if(r.top < vh * 0.75 && r.bottom > vh * 0.15){
    playOnce();
    io.unobserve(video);
  }
})();

/* ④ 製品画像のスクロール連動リビール */
(() => {
  const sec = document.getElementById('steamAnswer');
  const bg  = sec && sec.querySelector('.steam-answer__bg');
  if(!sec || !bg) return;

  const { clamp, bindScroll, reduceMotion } = window.LP;

  if(reduceMotion){
    bg.style.opacity = '1';
    bg.style.transform = 'translateX(-50%)';
    return;
  }

  bindScroll(() => {
    const vh = window.innerHeight;
    const r  = sec.getBoundingClientRect();
    /* セクション上端が画面下端に触れてから、画面高の70%進むまでを 0→1 */
    const p  = clamp((vh - r.top) / (vh * 0.7));
    bg.style.opacity   = p.toFixed(3);
    /* 既存CSSの translateX(-50%) を必ず維持すること（消すと中央寄せが崩れる） */
    bg.style.transform = 'translateX(-50%) scale(' + (1.06 - 0.06 * p).toFixed(4) + ')';
  });
})();

(() => {
  const el = document.getElementById('steamDesignSwiper');
  const root = document.querySelector('#steamDesign .steam-design__slider');
  if(!el || !root || typeof Swiper === 'undefined') return;

  const reduceMotion = window.LP && window.LP.reduceMotion;
  const prevEl = root.querySelector('.steam-design__nav--prev');
  const nextEl = root.querySelector('.steam-design__nav--next');
  const paginationEl = root.querySelector('.steam-design__pagination');
  const imgs = [...el.querySelectorAll('img')];

  const swiper = new Swiper(el, {
    rewind: true,
    initialSlide: 1,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 40,
    speed: 1000,
    watchSlidesProgress: true,
    autoplay: reduceMotion ? false : {
      delay: 4000,
      disableOnInteraction: false
    },
    navigation: {
      prevEl,
      nextEl
    },
    pagination: {
      el: paginationEl,
      clickable: true
    }
  });

  function refresh(){
    swiper.update();
  }

  let pending = imgs.filter((img) => !img.complete).length;
  if(!pending){
    requestAnimationFrame(refresh);
  } else {
    const done = () => {
      pending -= 1;
      if(pending > 0) return;
      requestAnimationFrame(refresh);
    };
    imgs.forEach((img) => {
      if(img.complete) return;
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  window.addEventListener('load', () => requestAnimationFrame(refresh), { once: true });
})();

