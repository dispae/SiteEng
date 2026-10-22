/* Эффекты для сайта репетитора. Сайт собран на React, поэтому всё добавляется поверх готовой страницы.
   g — живой градиент на первом экране, b — шейдер в карточках «Чем помогут занятия»,
   u — рисованное подчёркивание, f — рукописный шрифт у подчёркнутого слова, k — «нажатие» кнопок. */
(() => {
  /* Что включено. g — цвет градиента, b — вариант узора в «Чем помогут», u — подчёркивание (2 = ещё и «испанского») */
  const C = { g: 1, p: 0, b: 3, n: 1, r: 1, e: 1, u: 2, f: 0, d: 1, c: 0, m: 0, t: 0, o: 0 };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 767px), (hover: none)').matches;
  const root = document.documentElement;
  root.classList.add('efx-soft');

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const glProgram = (gl, frag) => {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    return (n) => gl.getUniformLocation(pr, n);
  };
  /* общий цикл: рисуем ~24 раза в секунду и только пока блок на экране */
  let lastScroll = 0;
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
  const loop = (el, draw, fps) => {
    let raf = 0, last = 0, vis = false;
    /* пока страницу листают, фон не перерисовываем — вся мощность уходит на плавную прокрутку */
    const tick = (t) => { raf = requestAnimationFrame(tick); if (t - last < 1000 / fps || performance.now() - lastScroll < 180) return; last = t; draw(t); };
    const sync = () => { const on = vis && !document.hidden && !reduce; if (on && !raf) raf = requestAnimationFrame(tick); if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; sync(); }).observe(el);
    document.addEventListener('visibilitychange', sync);
    draw(0);
  };

  /* Ждём, пока React нарисует страницу */
  const ready = (sel, fn) => {
    const el = document.querySelector(sel);
    if (el) { fn(el); return; }
    const mo = new MutationObserver(() => { const e = document.querySelector(sel); if (e) { mo.disconnect(); fn(e); } });
    mo.observe(document.body, { childList: true, subtree: true });
  };

  /* ---------- 1. Градиент на первом экране (Velaris, в тёплых тонах сайта) ---------- */
  const GRAD_FRAG = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 bg;uniform vec3 c[4];uniform vec2 ctr;
vec3 permute(vec3 x){return mod(((x*34.)+1.)*x,289.);}
float sn(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv-ctr;p.x*=r.x/r.y;float s=t*.01;
float n1=sn(p*.5+vec2(s*.2,-s*.3));float n2=sn(p*.7+vec2(-s*.15,s*.25)+n1*.3);float n3=sn(p*.9+vec2(s*.1,-s*.2)+n2*.25);
vec3 col=bg;col=mix(col,c[0],smoothstep(-.2,.6,n1)*.85);col=mix(col,c[1],smoothstep(-.1,.7,n2)*.7);
col=mix(col,c[2],smoothstep(-.3,.5,n3)*.55);col=mix(col,c[3],smoothstep(0.,.8,n1*n2)*.6);
float d=length(p)*1.3;col=mix(bg,col,1.-smoothstep(.7,1.5,d)*.6);gl_FragColor=vec4(col,1.);}`;
  const GRADS = {
    1: { bg: '#F9F1EA', c: ['#F0C2AE', '#E6A592', '#F2DCC2', '#D68C77'] },
    2: { bg: '#FAF3EA', c: ['#EDCFA8', '#E8B49E', '#F4E2C8', '#CF9672'] },
  };
  if (GRADS[C.g]) ready('main section, #root section', (hero) => {
    hero.setAttribute('data-efx-hero', '');
    const host = document.createElement('div');
    host.className = 'efx-grad'; host.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); host.appendChild(cv);
    hero.insertBefore(host, hero.firstChild);
    const gl = cv.getContext('webgl', { antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) { host.classList.add('efx-grad--css', 'is-on'); return; }
    const U = glProgram(gl, GRAD_FRAG), G = GRADS[C.g];
    gl.uniform3f(U('bg'), ...hex(G.bg)); gl.uniform3fv(U('c'), new Float32Array(G.c.flatMap(hex)));
    gl.uniform2f(U('ctr'), phone ? 0.5 : 0.62, phone ? 0.35 : 0.5);
    const ur = U('r'), ut = U('t');
    const fit = () => {
      const w = hero.clientWidth, h = hero.clientHeight, k = Math.min(0.4, Math.sqrt(200000 / Math.max(1, w * h)));
      cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(ur, cv.width, cv.height);
    };
    fit(); new ResizeObserver(fit).observe(hero);
    loop(hero, (t) => { gl.uniform1f(ut, 400 + t * 0.001 * 30); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }, phone ? 15 : 24);
    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add('is-on')));
  });

  /* ---------- 2. Карточки «Чем помогут занятия» с шейдером (Warp) ---------- */
  const WARP_FRAG = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c[4];
uniform float prop;uniform float soft;uniform float dist;uniform float swirl;uniform float iters;uniform float shape;uniform float sc;
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(uv-.5)*vec2(r.x/r.y,1.)*2.2;float s=t*.35;
for(int i=0;i<15;i++){if(float(i)>=iters)break;float fi=float(i);
p+=dist*vec2(sin(p.y*1.9+s+fi*.7),cos(p.x*1.9-s*.8+fi*1.1));float a=swirl*.06*length(p);p=mat2(cos(a),-sin(a),sin(a),cos(a))*p;}
float k=1./sc;float f;
if(shape<.5){f=sin(p.x*k*.25)*sin(p.y*k*.25);}else{vec2 g=fract(p*k*.12)-.5;f=(.32-length(g))*2.6;}
float w=smoothstep(-soft*.45,soft*.45,f+(prop-.4));float m=.5+.5*sin(p.x*1.2+p.y*1.6+s*.6);
gl_FragColor=vec4(mix(mix(c[0],c[1],m),mix(c[2],c[3],m),w),1.);}`;
  const CARDS = [
    { colors: ['#C17B6C', '#EDB9A6', '#9E5B4E', '#F4D9CC'], prop: 0.3, soft: 0.8, dist: 0.15, swirl: 0.6, iters: 8, shape: 0, sc: 0.08 },
    { colors: ['#D4AF7A', '#F0DCB8', '#B88C55', '#F8EDDA'], prop: 0.4, soft: 1.2, dist: 0.2, swirl: 0.9, iters: 12, shape: 1, sc: 0.12 },
    { colors: ['#C98A7A', '#F2CDBD', '#A8665A', '#F9E6DC'], prop: 0.35, soft: 0.9, dist: 0.18, swirl: 0.7, iters: 10, shape: 0, sc: 0.1 },
    { colors: ['#B9826B', '#E9C6AB', '#94604C', '#F5E0CF'], prop: 0.45, soft: 1.1, dist: 0.22, swirl: 0.8, iters: 15, shape: 1, sc: 0.09 },
    { colors: ['#D09A86', '#F4D4C4', '#B07462', '#FBEAE1'], prop: 0.38, soft: 0.95, dist: 0.16, swirl: 0.85, iters: 11, shape: 0, sc: 0.11 },
    { colors: ['#C7A07A', '#EDD6B9', '#A47C55', '#F7EAD8'], prop: 0.42, soft: 1.0, dist: 0.19, swirl: 0.75, iters: 9, shape: 1, sc: 0.13 },
  ];
  /* «узор при наведении» на телефоне не нужен: наведения там нет */
  if (C.b && !(C.b === 3 && phone)) ready('.avr-benefits-grid', (grid) => {
    const sec = grid.closest('section') || grid;
    sec.setAttribute('data-efx-b', C.b);
    /* Один WebGL на все карточки: рисуем узор каждой карточки по очереди и копируем в её холст */
    const W = 200, H = 176;
    const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
    const gl = glc.getContext('webgl', { antialias: false, depth: false, powerPreference: 'low-power', preserveDrawingBuffer: true });
    if (!gl) return;
    const U = glProgram(gl, WARP_FRAG);
    gl.viewport(0, 0, W, H); gl.uniform2f(U('r'), W, H);
    const u = { c: U('c'), t: U('t'), prop: U('prop'), soft: U('soft'), dist: U('dist'), swirl: U('swirl'), iters: U('iters'), shape: U('shape'), sc: U('sc') };
    const items = Array.from(grid.children).map((card, i) => {
      const cfg = CARDS[i % CARDS.length];
      card.setAttribute('data-efx-card', '');
      const host = C.b === 2 ? card.querySelector('.rounded-full') : card;
      if (!host) return null;
      const cv = document.createElement('canvas');
      cv.className = C.b === 2 ? 'efx-icon-shader' : 'efx-card-shader';
      cv.width = C.b === 2 ? 64 : W; cv.height = C.b === 2 ? 64 : H;
      cv.setAttribute('aria-hidden', 'true');
      host.insertBefore(cv, host.firstChild);
      return { card, cv, ctx: cv.getContext('2d'), cfg, hover: false };
    }).filter(Boolean);
    if (C.b === 3) items.forEach((it) => {
      it.card.addEventListener('pointerenter', () => { it.hover = true; });
      it.card.addEventListener('pointerleave', () => { it.hover = false; });
    });
    const paint = (it, t) => {
      const f = it.cfg;
      gl.uniform3fv(u.c, new Float32Array(f.colors.flatMap(hex)));
      gl.uniform1f(u.t, t * 0.001 * 0.8); gl.uniform1f(u.prop, f.prop); gl.uniform1f(u.soft, f.soft); gl.uniform1f(u.dist, f.dist);
      gl.uniform1f(u.swirl, f.swirl); gl.uniform1f(u.iters, f.iters); gl.uniform1f(u.shape, f.shape); gl.uniform1f(u.sc, f.sc);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      it.ctx.drawImage(glc, 0, 0, it.cv.width, it.cv.height);
    };
    let first = true;
    loop(sec, (t) => {
      items.forEach((it, i) => {
        /* при «наведении» оживает только карточка под курсором, остальные стоят */
        if (C.b === 3 && !it.hover && !first) return;
        paint(it, t + i * 3000);
      });
      first = false;
    }, 24);
  });

  /* ---------- 3. Рисованное подчёркивание (Underline hero) ---------- */
  const UL = '<svg class="efx-ul" viewBox="0 0 170 30" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9C32.8203 5.34032 108.769 -0.881146 166 3.51047" pathLength="1"/></svg>';
  const underline = (span) => {
    if (!span || span.querySelector('.efx-ul')) return;
    span.setAttribute('data-efx-under', '');
    if (/[?!.,]$/.test(span.textContent.trim())) span.setAttribute('data-efx-punct', '');
    if (C.f) span.setAttribute('data-efx-hand', '');
    span.insertAdjacentHTML('beforeend', UL);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => span.setAttribute('data-efx-drawn', ''), 650); } }, { threshold: 0.6 });
    io.observe(span);
  };
  const wordIn = (h, re) => Array.from(h.querySelectorAll('.fx-w')).find((s) => re.test(s.textContent));
  if (C.u) {
    ready('#sec-cta h2 .fx-w', () => underline(wordIn(document.querySelector('#sec-cta h2'), /уверенн/i)));
    if (C.u === 2) ready('h1 .fx-w', () => underline(wordIn(document.querySelector('h1'), /испанск/i)));
  }


  /* ---------- 6. Главные кнопки «Записаться»: объём, буквы перекатываются, контур и брызги (3D Button) ---------- */
  const SPLASH = '<svg class="efx-splash" viewBox="0 0 342 208" fill="none" aria-hidden="true">' + [
    'M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362',
    'M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893',
    'M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272|.4',
    'M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449|.4',
    'M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998',
    'M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976',
    'M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998',
    'M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976',
    'M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272|.4',
    'M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449|.4',
  ].map((d) => { const [p, o] = d.split('|'); return `<path d="${p}" stroke-width="3" stroke-linecap="round" pathLength="1"${o ? ` stroke-opacity="${o}"` : ''}/>`; }).join('') + '</svg>';
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ru', { granularity: 'grapheme' }) : null;
  const letters = (t, cls) => `<span class="efx-roll-line ${cls}">` + (seg ? Array.from(seg.segment(t), (x) => x.segment) : Array.from(t)).map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('') + '</span>';
  const btn3d = (b) => {
    if (!b || b.classList.contains('efx-3d')) return;
    b.setAttribute('data-efx-3d', '');
    const label = b.querySelector('span');
    if (label && !phone) {
      const t = label.textContent.trim();
      label.setAttribute('aria-label', t);
      label.classList.add('efx-roll');
      label.innerHTML = letters(t, 'efx-roll-a') + letters('Написать Дарье', 'efx-roll-b');
    }
    if (phone) return;
    b.insertAdjacentHTML('beforeend', SPLASH + '<svg class="efx-outline" aria-hidden="true"><rect pathLength="1"/></svg>');
    const fit = () => { const r = b.querySelector('.efx-outline rect'), w = b.offsetWidth + 12, h = b.offsetHeight + 12; r.setAttribute('x', 1.5); r.setAttribute('y', 1.5); r.setAttribute('width', w - 3); r.setAttribute('height', h - 3); r.setAttribute('rx', (h - 3) / 2); };
    fit(); new ResizeObserver(fit).observe(b);
    b.addEventListener('pointerenter', () => { b.removeAttribute('data-efx-burst'); void b.offsetWidth; b.setAttribute('data-efx-burst', ''); });
  };
  if (C.d) {
    ready('#root section button', btn3d);
    ready('#sec-cta button', btn3d);
  }


  /* ---------- 5. Новый подвал: имя с рисованным подчёркиванием, разделы, мессенджеры ---------- */
  if (C.o) ready('#sec-cta', () => ready('#site-footer-addon .ft-links', () => {
    const ft = document.getElementById('site-footer-addon');
    const links = Array.from(ft.querySelectorAll('.ft-link')).map((a) => ({ href: a.href, ic: a.querySelector('.ft-ic').innerHTML, lb: a.querySelector('.ft-lb').textContent.trim() }));
    ft.classList.add('efx-ft-on');
    document.documentElement.classList.add('efx-ft-joined');
    ft.innerHTML = `<div class="efx-ft">
      <div class="efx-ft-top">
        <div class="efx-ft-brand">
          <p class="efx-ft-name ft-name">Дарья <span class="efx-ft-surname ft-name">Одинцова</span></p>
          <p class="efx-ft-desc">Онлайн-репетитор английского и испанского языка для взрослых и детей</p>
        </div>
        <div class="efx-ft-contact">
          <p class="efx-ft-cap">Написать и записаться</p>
          <div class="efx-ft-btns">${links.map((l) => `<a class="efx-ft-btn" href="${l.href}" target="_blank" rel="noopener noreferrer"><span class="efx-ft-clip" aria-hidden="true"><span class="efx-ft-fill"></span></span><span class="efx-ft-ic" aria-hidden="true">${l.ic}</span><span class="efx-ft-lb">${l.lb}</span><svg class="efx-ft-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg></a>`).join('')}</div>
        </div>
      </div>
      <div class="efx-ft-bottom"><span>© ${new Date().getFullYear()} Дарья Одинцова</span><a href="#" class="efx-ft-up">Наверх<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></a></div>
    </div>`;
    if (!phone) ft.querySelectorAll('.efx-ft-btn').forEach((a) => {
      a.insertAdjacentHTML('beforeend', SPLASH);
      a.addEventListener('pointerenter', () => { a.removeAttribute('data-efx-burst'); void a.offsetWidth; a.setAttribute('data-efx-burst', ''); });
    });
    ft.querySelector('.efx-ft-up').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  }));


  /* ---------- 8. Отзывы: карточка приподнимается, звёзды загораются по очереди ---------- */
  const onView = (el, fn, th) => { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: th || 0.35 }); io.observe(el); };
  if (C.r) ready('#reviews .avr-card .avr-stars', () => {
    document.getElementById('reviews').setAttribute('data-efx-rev', '');
    document.querySelectorAll('#reviews .avr-stars').forEach((st) => {
      if (st.dataset.efx) return; st.dataset.efx = '1';
      st.setAttribute('aria-label', '5 из 5');
      st.innerHTML = Array.from(st.textContent.trim()).map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
    });
  });

  /* ---------- 10. Образование и опыт: пункты по очереди, «7 лет» досчитывает ---------- */
  if (C.e && !reduce) ready('#sec-edu .group', () => {
    const sec = document.getElementById('sec-edu');
    const items = Array.from(sec.querySelectorAll('.group'));
    sec.setAttribute('data-efx-edu', '');
    items.forEach((it, i) => it.style.setProperty('--i', i));
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let num = null, n;
    while ((n = walker.nextNode())) { if (/^\s*\d+\s*$/.test(n.nodeValue) || /\b\d+\s+лет/.test(n.nodeValue)) { num = n; break; } }
    let target = 0, span = null;
    if (num) {
      const m = num.nodeValue.match(/\d+/); target = +m[0];
      if (/^\s*\d+\s*$/.test(num.nodeValue)) { span = num.parentElement; }
      else { const [a, b] = num.nodeValue.split(m[0]); const frag = document.createDocumentFragment(); span = document.createElement('span'); span.textContent = m[0]; frag.append(a, span, b); num.replaceWith(frag); }
      span.classList.add('efx-count');
    }
    onView(items[0].parentElement, () => {
      sec.setAttribute('data-efx-in', '');
      if (span && target) { const t0 = performance.now(); const tick = (t) => { const k = Math.min(1, (t - t0) / 1200); span.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); }; span.textContent = '0'; setTimeout(() => requestAnimationFrame(tick), 500); }
    }, 0.2);
  });

  /* ---------- Простой просмотр фото крупно ---------- */
  const lightbox = (src, cap) => {
    const d = document.createElement('div');
    d.className = 'efx-lb'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', cap || 'Фото');
    d.innerHTML = `<figure><img src="${src}" alt=""><figcaption>${cap || ''}</figcaption></figure><button type="button" class="efx-lb-x" aria-label="Закрыть">×</button>`;
    const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('.efx-lb-x')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(d);
    d.querySelector('.efx-lb-x').focus();
  };

  /* ---------- 13–14. Сертификаты и «Как проходят занятия»: та же сетка карточек, только аккуратнее (3 варианта) ---------- */
  const polish = (secId, v, prefix) => ready(secId + ' .group img', () => {
    if (!v) return;
    root.classList.add(prefix + v);
    const sec = document.querySelector(secId);
    sec.querySelectorAll('.group').forEach((card, i) => {
      card.setAttribute('data-efx-pc', '');
      const cap = card.querySelector('h3, p');
      if (v === 2 && cap && !cap.querySelector('.efx-pc-no')) cap.insertAdjacentHTML('beforebegin', `<span class="efx-pc-no">${String(i + 1).padStart(2, '0')}</span>`);
    });
  });
  polish('#sec-certs', C.c, 'efx-cv');
  polish('#sec-lessons', C.m, 'efx-mv');

  /* ---------- 17. Наклон карточек за курсором с бликом (заметный) ---------- */
  if (C.t && !phone && !reduce) {
    const sel = '.efx-tiltable, .avr-benefits-grid > div';
    let cur = null, f = 0, ev = null;
    const paint = () => {
      f = 0; if (!cur || !ev) return;
      const r = cur.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      cur.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
      cur.style.setProperty('--ry', ((x - 0.5) * 18).toFixed(2) + 'deg');
      cur.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      cur.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    };
    const leave = (el) => { el.removeAttribute('data-tilt'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest && e.target.closest(sel);
      if (el !== cur) {
        if (cur) leave(cur);
        cur = el;
        if (cur) {
          cur.setAttribute('data-tilt', '');
          if (!cur.querySelector(':scope > .efx-glare2')) { const g = document.createElement('span'); g.className = 'efx-glare2'; g.setAttribute('aria-hidden', 'true'); cur.appendChild(g); }
        }
      }
      ev = e; if (cur && !f) f = requestAnimationFrame(paint);
    }, { passive: true });
  }

  /* ---------- 18. Фото на первом экране: глубина за курсором (заметная) ---------- */
  if (C.p && !phone && !reduce) ready('img[src$="hero.webp"]', (img) => {
    const hero = img.closest('section');
    img.parentElement.setAttribute('data-efx-depth', '');
    let f = 0, X = 0, Y = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect(); X = (e.clientX - r.left) / r.width - 0.5; Y = (e.clientY - r.top) / r.height - 0.5;
      if (!f) f = requestAnimationFrame(() => { f = 0; hero.style.setProperty('--dx', X.toFixed(3)); hero.style.setProperty('--dy', Y.toFixed(3)); });
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--dx', 0); hero.style.setProperty('--dy', 0); });
  });

  /* ---------- 15. Неоновая рамка: светится вокруг курсора, на телефоне вспыхивает от касания ---------- */
  if (C.n) {
    const SEL = '.avr-card, .avr-benefits-grid > div, #sec-edu .rounded-2xl.overflow-hidden, #sec-edu .bg-white.rounded-2xl';
    const attach = (el) => {
      if (el.dataset.neon) return; el.dataset.neon = '1';
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      const g = document.createElement('span'); g.className = 'efx-neon'; g.setAttribute('aria-hidden', 'true'); el.appendChild(g);
    };
    const scan = () => document.querySelectorAll(SEL).forEach(attach);
    scan(); setTimeout(scan, 1500); setTimeout(scan, 4000);
    let cur = null, f = 0, X = 0, Y = 0;
    const place = () => { f = 0; if (!cur) return; const r = cur.getBoundingClientRect(); cur.style.setProperty('--nx', (X - r.left) + 'px'); cur.style.setProperty('--ny', (Y - r.top) + 'px'); };
    const light = (el, on) => { if (!el) return; el.toggleAttribute('data-lit', on); };
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest && e.target.closest(SEL);
      if (el !== cur) { light(cur, false); cur = el; light(cur, true); }
      X = e.clientX; Y = e.clientY; if (cur && !f) f = requestAnimationFrame(place);
    }, { passive: true });
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest && e.target.closest(SEL);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--nx', (e.clientX - r.left) + 'px'); el.style.setProperty('--ny', (e.clientY - r.top) + 'px');
      if (e.pointerType === 'touch') { el.removeAttribute('data-tap'); void el.offsetWidth; el.setAttribute('data-tap', ''); setTimeout(() => el.removeAttribute('data-tap'), 1400); }
    }, { passive: true });
  }

  /* ---------- 16. Старый подвал, чуть аккуратнее ---------- */
  if (!C.o) root.classList.add('efx-ft-polish');

  /* ---------- 20. Просмотр фото: плавное приближение из карточки, зум работает, клик по фото не закрывает ---------- */
  {
    let fromRect = null, downOnImg = false, downX = 0, downY = 0;
    const lbx = () => document.querySelector('.lbx');
    /* запоминаем, где было фото в карточке, чтобы «вырасти» из него */
    document.addEventListener('click', (e) => {
      const card = e.target.closest && e.target.closest('#sec-certs .group, #sec-lessons .group');
      if (!card) return;
      const im = card.querySelector('img');
      fromRect = im ? im.getBoundingClientRect() : null;
    }, true);
    const grow = (img) => {
      if (!fromRect || reduce) return;
      const to = img.getBoundingClientRect();
      if (!to.width || !to.height) return;
      const s = Math.min(fromRect.width / to.width, fromRect.height / to.height);
      const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
      img.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2, .8, .2, 1)' });
      fromRect = null;
    };
    const hook = (box) => {
      if (box.__efx) return; box.__efx = true;
      const img = box.querySelector('.lbx-img');
      new MutationObserver(() => {
        if (!box.classList.contains('is-open')) return;
        if (img.complete && img.naturalWidth) requestAnimationFrame(() => grow(img));
        else img.addEventListener('load', () => grow(img), { once: true });
      }).observe(box, { attributes: true, attributeFilter: ['class'] });
      /* нажатие по самому фото — это зум, а не «закрыть» */
      box.addEventListener('pointerdown', (e) => { downOnImg = e.target === img; downX = e.clientX; downY = e.clientY; }, true);
      box.addEventListener('click', (e) => {
        if (!downOnImg) return;
        e.stopPropagation();
        const moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6;
        if (moved || Date.now() - (box._gestureEnd || 0) < 350) return;
        const touch = e.pointerType === 'touch' || (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents);
        /* мышь: клик по фото приближает и отдаляет; палец: двойной тап приближает (это делает сам сайт), один тап по приближенному фото — отдаляет */
        if (!touch || box.classList.contains('is-zoomed')) img.dispatchEvent(new MouseEvent('dblclick', { bubbles: false, clientX: e.clientX, clientY: e.clientY }));
      }, true);
      box.addEventListener('dblclick', (e) => { if (e.isTrusted) { e.stopPropagation(); e.preventDefault(); } }, true);
    };
    const find = () => { const b = lbx(); if (b) hook(b); return !!b; };
    if (!find()) { const mo = new MutationObserver(() => { if (find()) mo.disconnect(); }); mo.observe(document.body, { childList: true, subtree: true }); }
  }
})();
