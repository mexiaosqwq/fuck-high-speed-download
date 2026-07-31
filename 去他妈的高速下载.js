// ==UserScript==
// @name         去他妈的高速下载！
// @namespace    fuck-high-speed-download
// @version      1.0.5
// @description  去除各大软件/手游下载站的"高速下载/安全下载/软件管家/九游·应用宝·360助手"诱导，只保留普通下载，并让其自适应铺满原下载条。无新增界面、无网络请求、不破坏页面排版。
// @author       Claude
// @icon         https://github.githubassets.com/favicon.ico
// @noframes
// @run-at       document-start
// @grant        none
// @match        *://*.doyo.cn/*
// @match        *://*.9663.com/*
// @match        *://*.ddooo.com/*
// @match        *://*.downkuai.com/*
// @match        *://*.y8l.com/*
// @match        *://*.shouji.com.cn/*
// @match        *://*.qqtf.com/*
// @match        *://*.qqtn.com/*
// @match        *://*.qt6.com/*
// @match        *://*.289.com/*
// @match        *://*.j9p.com/*
// @match        *://*.5577.com/*
// @match        *://*.2265.com/*
// @match        *://*.87g.com/*
// @match        *://*.7000.com/*
// @match        *://*.7723.com/*
// @match        *://*.3h3.com/*
// @match        *://*.onlinedown.net/*
// @match        *://*.xitongzhijia.net/*
// @match        *://*.xitongtiandi.net/*
// @match        *://*.downza.cn/*
// @match        *://*.ucbug.com/*
// @match        *://*.32r.com/*
// @match        *://*.42xz.com/*
// @match        *://*.xz7.com/*
// @match        *://*.pc6.com/*
// @match        *://*.xiazaiba.com/*
// @match        *://*.cr173.com/*
// @match        *://*.cncrk.com/*
// @match        *://*.crsky.com/*
// @match        *://*.mydown.com/*
// @match        *://*.duote.com/*
// @match        *://*.uzzf.com/*
// @match        *://*.jb51.net/*
// @match        *://*.downcc.com/*
// @match        *://*.downxia.com/*
// @match        *://*.winwin7.com/*
// @match        *://*.liqucn.com/*
// @match        *://*.ali213.net/*
// @match        *://*.itmop.com/*
// @match        *://*.xpgod.com/*
// @match        *://*.jisuxz.com/*
// @match        *://*.wmzhe.com/*
// @match        *://*.veryhuo.com/*
// @match        *://*.pc0359.cn/*
// @license      GPL
// ==/UserScript==

(function () {
    'use strict';

    /* ============================================================
     * 配置
     * ============================================================ */
    const AUTO_CLICK = false;
    const MAX_CLICKS = 6;
    const RELABEL   = true;
    const IDLE_STOP = 20000;

    /* ============================================================
     * 规则
     * ============================================================ */
    const FAKE_TEXT = /高速下载|安全下载|极速下载|高速安装|安全安装|优先下载|推荐下载|管家下载|软件管家|电脑管家|软件助手|手机助手|应用宝|360助手|九游APP|豌豆荚APP|高速通道|安全通道|极速通道|使用下载器|需下载器|需下载应用市场|下载器下载|跳转至第三方|Windsoul|anquanxiazai/i;

    const NEG_STRIP = /无需下载|不需下载|不用下载|必需下载|所需下载|按需下载|无需安装|免安装/g;

    const REAL_TEXT = /普通下载|本地下载|本地地址|普通地址|普通链接|普通通道|直接下载|直链下载|官方下载|官网下载|电信下载|联通下载|移动下载|网通下载|其他下载|安卓下载|苹果下载|iPhone下载|下载地址[一二三四1-9]/;

    const FAKE_HREF = /(\.360\.cn|360tpcdn\.com|sj\.qq\.com|wandoujia\.com|pp\.cn|qweqwi\.com\/api\/getUrl|\/api\/getUrl\?|getUrl\?channel=|\/(?:wdj|yyb|sjzs|zhushou|guanjia)\/?$|down(?:load)?er|softmgr|qqpcmgr|quickdownload)/i;

    const PROMO_CB_TEXT = /360助手|360手机助手|九游|应用宝|豌豆荚|手机助手|应用市场|安全下载|高速下载|极速下载|加速下载|安全安装|快速安装|安全为您|为您安全/;

    const PROMO_CB_ID = /(yingyongbao|jiuyou|zhushou|wandoujia|wdj|sjzs|market|360|qqpcmgr|guanjia|anquan|gaosu|jisu)/i;

    const FAKE_SELECTORS = [
        '.m-down-fix', '.fast-down-bar', '.speed-down-box', '.anzhuang-fixed-bar',
        '#fast_0', '.sh-down-btn', '.ddgs_down', '.btn-dl_swift', '.m_swift',
        '.top-speed-download', '.aqDownload', '#gaosuxiazai', '.u-gs-btn',
        '#gsxza', '.gaosu_btn', '.Gs_d', '.fast-down-btn', '.downFast-list',
        '.f-uzzf-down', '.gsdown', '.downgs', '.dl_gaosu', '#box99btn', '#downBoxGaosu'
    ];

    const TOGGLE_TEXT = /下载地址|下载线路|其他下载|更多下载|本地下载|普通下载|下载方式|选择线路|展开|更多/;

    const CLICK_UNSAFE = /window\.open|\bopen\s*\(|location\s*[.=]|\.href\s*=|\.submit\s*\(|https?:|\.exe|\.apk|\.zip|\.rar|download/i;

    const BTN_SEL = 'a,button,[role="button"],input[type="submit"],input[type="button"]';
    const SOLO_CLASS = '__hsdb-solo';

    /* ============================================================
     * 弹窗闸门
     * ============================================================ */
    const popupGuard = (() => {
        const rawOpen = window.open;
        const stub = {
            closed: true, close() {}, focus() {}, blur() {}, postMessage() {},
            document: null, location: { href: '', replace() {}, assign() {} }
        };
        let depth = 0, until = 0;

        function armed() { return depth > 0 || Date.now() < until; }

        try {
            window.open = function (...args) {
                if (armed()) return stub;
                return rawOpen.apply(window, args);
            };
        } catch (e) { /* window.open 不可写 */ }

        window.addEventListener('click', e => {
            if (!armed()) return;
            if (e.isTrusted) { until = 0; return; }
            const t = e.target;
            const a = t && t.closest && t.closest('a[target="_blank"],a[target="_new"]');
            if (a) { e.preventDefault(); e.stopPropagation(); }
        }, true);

        return function guardedClick(el) {
            depth++;
            let ok = true;
            try { el.click(); } catch (e) { ok = false; }
            finally { depth--; until = Date.now() + 600; }
            return ok;
        };
    })();

    /* ============================================================
     * 工具
     * ============================================================ */
    function text(el) {
        const t = el.tagName === 'INPUT'
            ? (el.value || '')
            : (el.textContent || el.getAttribute('title') || el.getAttribute('aria-label') || '');
        return t.replace(/\s+/g, ' ').trim();
    }

    function attr(el, name) {
        return (el.getAttribute && el.getAttribute(name)) || '';
    }

    function flat(el) {
        return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    function isFake(el) {
        const t = text(el);
        if (t && t.length <= 40 && FAKE_TEXT.test(t.replace(NEG_STRIP, ''))) return true;
        const h = attr(el, 'href');
        if (h && h !== '#' && FAKE_HREF.test(h)) return true;
        const oc = attr(el, 'onclick');
        if (oc && FAKE_HREF.test(oc)) return true;
        return false;
    }

    function hiddenBy(el) {
        for (let c = el; c && c.nodeType === 1 && c !== document.documentElement; c = c.parentElement) {
            const cs = getComputedStyle(c);
            if (cs.display === 'none' || cs.visibility === 'hidden') return c;
            if (c.hasAttribute('hidden')) return c;
        }
        return null;
    }

    function hide(el) {
        if (el && el.style && el.style.display !== 'none') {
            el.style.setProperty('display', 'none', 'important');
        }
    }

    const tried = new WeakSet();
    const promoLocks = new Set();
    const touchedBoxes = new Set();
    let clicks = 0;

    /* ============================================================
     * 1. 推广勾选框
     * ============================================================ */
    function uncheck(cb) {
        if (!cb.checked) return;
        cb.checked = false;
        try { cb.dispatchEvent(new Event('input',  { bubbles: true })); } catch (e) { /* 忽略 */ }
        try { cb.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) { /* 忽略 */ }
        if (cb.checked && attr(cb, 'onclick')) popupGuard(cb);
    }

    function promoBox(cb) {
        let box = null;
        let c = cb.parentElement;
        for (let hops = 0; c && hops < 6 && c !== document.body && c !== document.documentElement;
             c = c.parentElement, hops++) {
            const t = flat(c);
            if (t.length > 90) break;
            if ([...c.querySelectorAll('a')].some(a => REAL_TEXT.test(text(a)))) break;
            if (PROMO_CB_TEXT.test(t)) box = c;
        }
        return box;
    }

    function isPromoCheckbox(cb) {
        const label = cb.closest('label');
        const own = [flat(label), flat(cb.parentElement), flat(cb.closest('.mobLgIn'))].join(' ');
        if (own && own.length <= 120 && PROMO_CB_TEXT.test(own)) return true;

        const idish = [cb.id, cb.name, attr(cb, 'value'), cb.className].join(' ');
        if (idish.trim() && PROMO_CB_ID.test(idish)) return true;

        const near = cb.closest('.mobLgIn') || cb.parentElement;
        if (near) {
            for (const a of near.querySelectorAll('a[href]')) {
                if (FAKE_HREF.test(attr(a, 'href'))) return true;
            }
        }
        return false;
    }

    function stripPromoCheckbox() {
        for (const cb of document.querySelectorAll('input[type="checkbox"]')) {
            if (!promoLocks.has(cb)) {
                if (!isPromoCheckbox(cb)) continue;
                promoLocks.add(cb);
            }
            uncheck(cb);

            if (tried.has(cb)) continue;
            tried.add(cb);

            const box = promoBox(cb) || cb.closest('.mobLgIn') || cb.closest('label');
            if (box) {
                if (box.parentElement) touchedBoxes.add(box.parentElement);
                hide(box);
            } else {
                hide(cb);
            }
            const scope = (box && box.parentElement) || cb.parentElement;
            if (scope) {
                for (const sib of scope.children) {
                    if (sib === box) continue;
                    const t = flat(sib);
                    if (t && t.length <= 60 && PROMO_CB_TEXT.test(t)
                        && !sib.querySelector(BTN_SEL) && !/^(a|button)$/i.test(sib.tagName)) {
                        hide(sib);
                    }
                }
            }
        }
    }

    /* ============================================================
     * 2. 展开被折叠的普通下载
     * ============================================================ */
    function safeToClick(el) {
        if (tried.has(el)) return false;
        if (isFake(el)) return false;

        if (el.tagName === 'A') {
            const h = attr(el, 'href');
            if (h && h !== '#' && !/^javascript:\s*(void\(0\)|;)?\s*$/i.test(h) && !/^#/.test(h)) return false;
        }
        if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox') return false;

        for (const a of ['onclick', 'onmousedown', 'ontouchstart', 'href', 'data-url', 'data-href', 'data-link']) {
            const v = attr(el, a);
            if (v && CLICK_UNSAFE.test(v)) return false;
        }
        const form = el.closest && el.closest('form');
        if (form && attr(form, 'action')) return false;

        return true;
    }

    function unhideAncestors(el) {
        for (let c = el.parentElement; c && c.nodeType === 1 && c !== document.documentElement; c = c.parentElement) {
            if (getComputedStyle(c).display === 'none') {
                c.style.removeProperty('display');
                if (getComputedStyle(c).display === 'none') {
                    c.style.setProperty('display', 'revert', 'important');
                }
            }
            if (getComputedStyle(c).visibility === 'hidden') {
                c.style.setProperty('visibility', 'visible', 'important');
            }
            if (c.hasAttribute('hidden')) c.removeAttribute('hidden');
        }
    }

    function expandCollapsed() {
        const targets = [];
        for (const el of document.querySelectorAll(BTN_SEL)) {
            const t = text(el);
            if (t && t.length <= 40 && REAL_TEXT.test(t) && !isFake(el) && hiddenBy(el)) targets.push(el);
        }
        if (!targets.length) return;

        for (const t of targets) {
            if (AUTO_CLICK && clicks < MAX_CLICKS) {
                const blocker = hiddenBy(t);
                const scope = (blocker && blocker.parentElement) || document.body;
                if (scope) {
                    const cands = scope.querySelectorAll(
                        '[role="tab"],.tab,.tabs>*,li,label,span,button,' +
                        'input[type="radio"],input[type="checkbox"],[data-toggle],[aria-controls]'
                    );
                    for (const c of cands) {
                        if (clicks >= MAX_CLICKS) break;
                        if (!safeToClick(c)) continue;
                        const ct = text(c);
                        const isSwitch = (ct && ct.length <= 20 && TOGGLE_TEXT.test(ct))
                            || c.tagName === 'INPUT'
                            || c.hasAttribute('aria-controls') || c.hasAttribute('data-toggle');
                        if (!isSwitch) continue;
                        tried.add(c); clicks++;
                        popupGuard(c);
                        if (!hiddenBy(t)) break;
                    }
                }
            }
            if (hiddenBy(t)) unhideAncestors(t);
        }
    }

    /* ============================================================
     * 3. 隐藏诱导按钮
     * ============================================================ */
    function hideFakes() {
        for (const el of document.querySelectorAll(BTN_SEL)) {
            if (!isFake(el)) continue;
            if (el.querySelector && el.querySelector(BTN_SEL)) continue;
            if (el.style.display !== 'none') {
                const p = el.parentElement;
                if (p) {
                    touchedBoxes.add(p);
                    if (p.parentElement) touchedBoxes.add(p.parentElement);
                }
                hide(el);
            }
        }
    }

    /* ============================================================
     * 4. 自适应
     * ============================================================ */
    function fillRealDownload() {
        for (const box of touchedBoxes) {
            if (!box || !box.isConnected) { touchedBoxes.delete(box); continue; }
            const btns = [...box.querySelectorAll(BTN_SEL)]
                .filter(el => getComputedStyle(el).display !== 'none');
            if (btns.length !== 1) continue;
            const el = btns[0];
            if (!REAL_TEXT.test(text(el))) continue;
            box.classList.add(SOLO_CLASS);
            if (RELABEL && text(el) !== '普通下载' && !el.querySelector('img,svg,i')) {
                el.textContent = '普通下载';
            }
        }
    }

    /* ============================================================
     * CSS
     * ============================================================ */
    (function injectCss() {
        const frag = document.createDocumentFragment();
        const ok = FAKE_SELECTORS.filter(s => {
            try { frag.querySelector(s); return true; } catch (e) { return false; }
        });
        let css = '';
        if (ok.length) css += ok.join(',') + '{display:none!important}\n';
        css += '.' + SOLO_CLASS + '{display:flex!important;flex-wrap:wrap!important;'
             + 'align-items:center!important;width:100%!important;box-sizing:border-box!important}\n';
        css += '.' + SOLO_CLASS + '>a,.' + SOLO_CLASS + '>button,.' + SOLO_CLASS + ' a.new-btn{'
             + 'flex:1 1 100%!important;box-sizing:border-box!important;'
             + 'text-align:center!important;margin:4px 0!important}\n';
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
        } catch (e) {
            try {
                const el = document.createElement('style');
                el.textContent = css;
                (document.head || document.documentElement).appendChild(el);
            } catch (e2) { /* CSP 拒绝 */ }
        }
    })();

    /* ============================================================
     * 调度
     * ============================================================ */
    let observer = null, suppress = false, timer = 0, lastWork = Date.now();

    function run() {
        if (suppress) return;
        suppress = true;
        try {
            stripPromoCheckbox();
            expandCollapsed();
            hideFakes();
            fillRealDownload();
        } catch (e) { /* 静默 */ }
        finally {
            if (observer) observer.takeRecords();
            suppress = false;
        }
    }

    function schedule() {
        lastWork = Date.now();
        if (timer) return;
        timer = setTimeout(() => { timer = 0; run(); }, 60);
    }

    observer = new MutationObserver(recs => {
        if (suppress) return;
        for (const m of recs) {
            if (m.type === 'characterData') { schedule(); return; }
            for (const n of m.addedNodes) if (n.nodeType === 1) { schedule(); return; }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    run();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    }
    window.addEventListener('load', run, { once: true });
    window.addEventListener('pageshow', run);

    [100, 300, 800, 1500, 2500, 4000, 6000].forEach(ms => setTimeout(run, ms));

    /* 1.0.5：滚动兜底。很多站的浮动下载条靠 class 切换显示/隐藏，
     * MutationObserver 不监听 attributes，class 变化完全漏掉。
     * 滚动停止 300ms 后重跑一轮，被动式省电。 */
    let scrollTimer = 0;
    window.addEventListener('scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => { scrollTimer = 0; run(); }, 300);
    }, { passive: true });

    const idleCheck = setInterval(() => {
        if (Date.now() - lastWork < IDLE_STOP) return;
        clearInterval(idleCheck);
        if (observer) observer.disconnect();
    }, 5000);

    window.addEventListener('popstate', () => { clicks = 0; run(); });
})();