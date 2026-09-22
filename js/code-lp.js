/* code-lp.js - STENA LP behaviors */

window.LP = (() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

  /* iOS Safari 向け：可視性／スクロール fallback を1本の poll に集約 */
  const scrollPoll = (() => {
    const subscribers = new Set();
    let intervalId = 0;
    const POLL_MS = 200;

    function subscribe(fn){
      subscribers.add(fn);
      if(!intervalId){
        intervalId = setInterval(() => {
          subscribers.forEach((cb) => cb());
        }, POLL_MS);
      }
      return () => {
        subscribers.delete(fn);
        if(!subscribers.size && intervalId){
          clearInterval(intervalId);
          intervalId = 0;
        }
      };
    }

    return { subscribe };
  })();

  function bindScroll(fn){
    let last = 0;
    function run(){
      const now = performance.now();
      if(now - last < 8) return;
      last = now;
      fn();
    }
    window.addEventListener('scroll', run, { passive: true });
    window.addEventListener('touchmove', run, { passive: true });
    window.addEventListener('resize', run, { passive: true });
    if(window.visualViewport){
      window.visualViewport.addEventListener('scroll', run, { passive: true });
      window.visualViewport.addEventListener('resize', run, { passive: true });
    }
    const unsubPoll = scrollPoll.subscribe(run);
    run();
    return unsubPoll;
  }

  function inViewRect(el, options = {}){
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const inset = 40;
    if(r.bottom <= inset || r.top >= vh - inset) return false;
    const minRatio = typeof options.threshold === 'number' ? options.threshold : 0;
    if(minRatio <= 0) return true;
    const visible = Math.min(r.bottom, vh - inset) - Math.max(r.top, inset);
    return visible > 0 && visible / Math.max(r.height, 1) >= minRatio;
  }

  function whenVisible(el, onEnter, options = {}){
    if(!el || typeof onEnter !== 'function') return () => {};

    const rootMargin = options.rootMargin || '0px 0px -12% 0px';
    const once = options.once !== false;
    const onLeave = typeof options.onLeave === 'function' ? options.onLeave : null;
    const threshold = typeof options.threshold === 'number' ? options.threshold : 0;
    let alive = true;
    let wasIn = false;
    let enteredOnce = false;
    let io = null;
    let unsubPoll = null;

    const teardown = () => {
      if(!alive) return;
      alive = false;
      if(io) io.disconnect();
      io = null;
      window.removeEventListener('scroll', onScrollFallback);
      window.removeEventListener('touchmove', onScrollFallback);
      if(unsubPoll) unsubPoll();
      unsubPoll = null;
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
      setIn(inViewRect(el, { threshold }));
    };

    if('IntersectionObserver' in window){
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if(entry.target !== el) return;
          if(threshold > 0){
            setIn(entry.isIntersecting && entry.intersectionRatio >= threshold);
            return;
          }
          setIn(entry.isIntersecting);
        });
      }, { threshold: threshold > 0 ? [0, threshold] : 0, rootMargin });
      io.observe(el);
    }

    window.addEventListener('scroll', onScrollFallback, { passive: true });
    window.addEventListener('touchmove', onScrollFallback, { passive: true });
    unsubPoll = scrollPoll.subscribe(onScrollFallback);
    onScrollFallback();

    return teardown;
  }

  function initRevealInView(selector, options = {}){
    const els = [...document.querySelectorAll(selector)];
    if(!els.length) return;

    const pending = new Set(els);
    const show = (el) => {
      if(!pending.has(el)) return;
      pending.delete(el);
      const delay = Number(el.dataset.revealDelay) || 0;
      setTimeout(() => el.classList.add('is-shown'), delay);
    };

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
        if(!inViewRect(el)) return;
        show(el);
      });
    };
    window.addEventListener('scroll', onScrollFallback, { passive: true });
    window.addEventListener('touchmove', onScrollFallback, { passive: true });
    const unsubPoll = scrollPoll.subscribe(() => {
      if(!pending.size){
        unsubPoll();
        return;
      }
      onScrollFallback();
    });
    onScrollFallback();
  }

  function initLpModal(){
    const dialog = document.getElementById('lpModal');
    const img = document.getElementById('lpModalImg');
    if(!dialog || !img || typeof dialog.showModal !== 'function') return;

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
  }

  function initFixCta(){
    const fixCta = document.getElementById('fixCta');
    if(!fixCta) return;

    const FALLBACK_START = 1800;
    let anchor = null;
    let isVisible = false;
    let hideTimer = null;

    function resolveAnchor(){
      const selector = document.body.dataset.fixCtaAfter;
      anchor = selector ? document.querySelector(selector) : null;
    }

    function showStartPosition(){
      return anchor
        ? anchor.getBoundingClientRect().bottom + window.scrollY
        : FALLBACK_START;
    }

    function showFixCta(){
      if(isVisible) return;
      clearTimeout(hideTimer);

      fixCta.style.display = 'block';
      fixCta.style.opacity = '0';
      fixCta.offsetHeight;

      fixCta.style.opacity = '1';
      isVisible = true;
    }

    function hideFixCta(){
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

    function handleScroll(){
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

    resolveAnchor();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      resolveAnchor();
      handleScroll();
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      resolveAnchor();
      handleScroll();
    }, { passive: true });
    handleScroll();
  }

  const resumeVideos = new Set();

  document.addEventListener('visibilitychange', () => {
    if(document.hidden) return;
    resumeVideos.forEach((tryPlay) => tryPlay());
  });

  function initSectionVideos(){
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

      if(reduceMotion){
        video.removeAttribute('autoplay');
      }

      whenVisible(host, () => {
        shouldPlay = true;
        tryPlay();
      }, {
        once: false,
        onLeave(){
          shouldPlay = false;
          video.pause();
        }
      });

      resumeVideos.add(tryPlay);
    });
  }

  function initIntroHookVideo(){
    const videos = document.querySelectorAll('#introHook .intro3-bg');
    if(!videos.length) return;

    const mq = window.matchMedia('(max-width:760px)');

    videos.forEach((video) => {
      const srcSp = video.dataset.srcSp;
      const srcPc = video.dataset.srcPc || video.getAttribute('src');
      if(!srcSp || !srcPc) return;

      const pickSrc = () => (mq.matches ? srcSp : srcPc);

      const applySrc = () => {
        const next = pickSrc();
        if(video.getAttribute('src') === next) return;
        video.setAttribute('src', next);
        video.load();
        const play = video.play();
        if(play && play.catch) play.catch(() => {});
      };

      applySrc();
      if(mq.addEventListener) mq.addEventListener('change', applySrc);
      else mq.addListener(applySrc);
    });
  }

  function initSteamCostCounter(){
    const figure = document.querySelector('#steamCost .steam-cost__figure');
    const num = figure && figure.querySelector('.steam-cost__num');
    if(!figure || !num) return;

    const target = parseInt(num.getAttribute('data-to'), 10);
    if(!Number.isFinite(target)) return;

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

    whenVisible(figure, animate);
  }

  function initTankHeroVideo(){
    document.querySelectorAll('.tank-hero__visual').forEach((video) => {
      whenVisible(video, () => {
        video.currentTime = 0;
        const p = video.play();
        if(p && p.catch) p.catch(() => {});
      }, {
        once: true,
        threshold: 0.35,
        rootMargin: '0px 0px -8% 0px'
      });
    });
  }

  function initSteamAnswerParallax(){
    const sec = document.getElementById('steamAnswer');
    const bg  = sec && sec.querySelector('.steam-answer__bg');
    if(!sec || !bg) return;

    if(reduceMotion){
      bg.style.opacity = '1';
      bg.style.transform = 'translateX(-50%)';
      return;
    }

    bindScroll(() => {
      const vh = window.innerHeight;
      const r  = sec.getBoundingClientRect();
      const p  = clamp((vh - r.top) / (vh * 0.7));
      bg.style.opacity   = p.toFixed(3);
      bg.style.transform = 'translateX(-50%) scale(' + (1.06 - 0.06 * p).toFixed(4) + ')';
    });
  }

  function initSteamDesignSwiper(){
    const el = document.getElementById('steamDesignSwiper');
    const root = document.querySelector('#steamDesign .steam-design__slider');
    if(!el || !root || typeof Swiper === 'undefined') return;

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
  }

  function init(){
    initRevealInView('.reveal');
    initLpModal();
    initFixCta();
    initSectionVideos();
    initIntroHookVideo();
    initSteamCostCounter();
    initTankHeroVideo();
    initSteamAnswerParallax();
    initSteamDesignSwiper();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { reduceMotion };
})();

if(window.__lpJsWatchdog) clearTimeout(window.__lpJsWatchdog);
