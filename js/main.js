/**
 * こころのクリニック - Main JavaScript
 * ハンバーガーメニュー、スクロールアニメーション、フォームセキュリティ
 */
'use strict';

/**
 * HTMLエスケープ関数（XSS防止）
 */
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// JSが正常に動作していることをCSSに伝える
document.documentElement.classList.add('js-loaded');

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const header = document.querySelector('.header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollTopBtn = document.getElementById('scrollTop');
    const fadeElements = document.querySelectorAll('.fade-in');

    // ============================================
    // ハンバーガーメニュー
    // ============================================
    
    /**
     * モバイルメニューの開閉を切り替え
     */
    function toggleMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        const isOpen = nav.classList.contains('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        // aria-expanded切替（a11y）
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    }

    /**
     * モバイルメニューを閉じる
     */
    function closeMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'メニューを開く');
        }
    }

    // ハンバーガーボタンのクリックイベント
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // ナビリンクをクリックしたらメニューを閉じる
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // メニュー外をクリックしたらメニューを閉じる
    document.addEventListener('click', (e) => {
        if (nav && nav.classList.contains('active')) {
            if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // Escキーでメニューを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    // ============================================
    // ヘッダーのスクロール時の挙動
    // ============================================
    
    let lastScrollY = 0;
    let ticking = false;

    /**
     * スクロール位置に応じてヘッダーのスタイルを変更
     */
    function updateHeader() {
        const scrollY = window.scrollY;
        
        // スクロール位置が50px以上でヘッダーにスタイルを追加
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader();
            });
            ticking = true;
        }
    });

    // ============================================
    // スクロールトップボタン
    // ============================================
    
    /**
     * スクロールトップボタンの表示/非表示を切り替え
     */
    function toggleScrollTopButton() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    /**
     * ページトップへスムーススクロール
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    if (scrollTopBtn) {
        window.addEventListener('scroll', toggleScrollTopButton);
        scrollTopBtn.addEventListener('click', scrollToTop);
    }

    // ============================================
    // スクロールアニメーション（スタガー付きフェードイン）
    // ============================================

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    /**
     * スタガー対応のIntersectionObserver
     * グリッド内の要素に遅延差を付与
     */
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 親グリッド内でのインデックスを取得してスタガー遅延
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(function(c) {
                        return c.classList.contains('fade-in') || c.classList.contains('fade-in-up');
                    });
                    const idx = siblings.indexOf(entry.target);
                    if (idx > 0) {
                        entry.target.style.transitionDelay = (idx * 150) + 'ms';
                    }
                }
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // フェードイン要素を監視
    fadeElements.forEach(el => {
        fadeInObserver.observe(el);
    });

    // fade-in-up, fade-in-left, fade-in-right も監視
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(function(el) {
        fadeInObserver.observe(el);
    });

    // ============================================
    // スムーススクロール（アンカーリンク）
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // # だけの場合はスキップ
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = targetPosition - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // 現在のセクションをハイライト
    // ============================================
    
    const sections = document.querySelectorAll('section[id]');
    
    /**
     * 現在表示中のセクションに対応するナビリンクをハイライト
     */
    function highlightNavLink() {
        const scrollY = window.scrollY;
        const headerHeight = header ? header.offsetHeight : 0;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // ============================================
    // フォームセキュリティ（バリデーション・XSS防止・二重送信防止・レート制限）
    // ============================================

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        let isSubmitting = false;
        let submitCount = 0;
        let lastSubmitTime = 0;
        const RATE_LIMIT_INTERVAL = 60000; // 1分
        const MAX_SUBMITS_PER_INTERVAL = 3;

        /**
         * フィールドにエラーメッセージを設定（a11y対応）
         */
        function setFieldError(field, message) {
            field.setAttribute('aria-invalid', 'true');
            field.style.borderColor = '#e53e3e';
            var errorId = field.getAttribute('aria-describedby');
            if (errorId) {
                var errorEl = document.getElementById(errorId.split(' ')[0]);
                if (errorEl && errorEl.classList.contains('form-error')) {
                    errorEl.textContent = message;
                    errorEl.style.display = 'block';
                }
            }
        }

        /**
         * フィールドのエラーをリセット
         */
        function clearFieldError(field) {
            field.removeAttribute('aria-invalid');
            field.style.borderColor = '';
            var errorId = field.getAttribute('aria-describedby');
            if (errorId) {
                var errorEl = document.getElementById(errorId.split(' ')[0]);
                if (errorEl && errorEl.classList.contains('form-error')) {
                    errorEl.textContent = '';
                    errorEl.style.display = 'none';
                }
            }
        }

        contactForm.addEventListener('submit', function(e) {
            // 二重送信防止
            if (isSubmitting) {
                e.preventDefault();
                return false;
            }

            // レート制限チェック
            var now = Date.now();
            if (now - lastSubmitTime < RATE_LIMIT_INTERVAL) {
                submitCount++;
            } else {
                submitCount = 1;
                lastSubmitTime = now;
            }

            if (submitCount > MAX_SUBMITS_PER_INTERVAL) {
                e.preventDefault();
                var formErrors = document.getElementById('form-errors');
                if (formErrors) {
                    formErrors.textContent = '送信回数が多すぎます。しばらくお待ちください。';
                }
                return false;
            }

            var isValid = true;
            var firstErrorField = null;
            var errorMessages = [];
            var requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(function(field) {
                // 既存エラーをリセット
                clearFieldError(field);

                var value = field.type === 'checkbox' ? field.checked : field.value.trim();

                // チェックボックスの必須チェック
                if (field.type === 'checkbox') {
                    if (!value) {
                        setFieldError(field, 'この項目は必須です');
                        isValid = false;
                        if (!firstErrorField) firstErrorField = field;
                        errorMessages.push('プライバシーポリシーへの同意が必要です');
                    }
                    return;
                }

                // 空チェック
                if (!value) {
                    setFieldError(field, 'この項目は必須です');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = field;
                    return;
                }

                // メールバリデーション
                if (field.type === 'email') {
                    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(value)) {
                        setFieldError(field, '正しいメールアドレスを入力してください');
                        isValid = false;
                        if (!firstErrorField) firstErrorField = field;
                    }
                }

                // 電話番号バリデーション
                if (field.type === 'tel') {
                    var phonePattern = /^[\d\-\+\(\)\s]{10,15}$/;
                    if (!phonePattern.test(value)) {
                        setFieldError(field, '正しい電話番号を入力してください');
                        isValid = false;
                        if (!firstErrorField) firstErrorField = field;
                    }
                }

                // XSSパターン検出
                var dangerousPattern = /<script|javascript:|on\w+\s*=/i;
                if (typeof value === 'string' && dangerousPattern.test(value)) {
                    setFieldError(field, '使用できない文字が含まれています');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = field;
                }
            });

            // ハニーポット検出
            var honeypot = contactForm.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                e.preventDefault();
                return false;
            }

            if (!isValid) {
                e.preventDefault();
                // aria-live エリアにエラー通知
                var formErrors = document.getElementById('form-errors');
                if (formErrors) {
                    formErrors.textContent = '入力内容にエラーがあります。赤く表示された項目をご確認ください。';
                }
                if (firstErrorField) firstErrorField.focus();
                return false;
            }

            // 送信中状態にする
            isSubmitting = true;
            var submitBtn = contactForm.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '送信中...';
                submitBtn.setAttribute('aria-busy', 'true');
            }

            // reCAPTCHA プレースホルダー（将来実装用）
            // if (typeof grecaptcha !== 'undefined') {
            //     e.preventDefault();
            //     grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'}).then(function(token) {
            //         var input = document.createElement('input');
            //         input.type = 'hidden';
            //         input.name = 'g-recaptcha-response';
            //         input.value = token;
            //         contactForm.appendChild(input);
            //         contactForm.submit();
            //     });
            //     return false;
            // }
        });

        // 入力時にエラー表示をリセット
        contactForm.querySelectorAll('input, textarea, select').forEach(function(field) {
            field.addEventListener('input', function() {
                clearFieldError(this);
                var formErrors = document.getElementById('form-errors');
                if (formErrors) formErrors.textContent = '';
            });
        });
    }

    // ============================================
    // PREMIUM: ローディングアニメーション
    // ============================================
    var loader = document.getElementById('loader');
    function hideLoader() {
        if (!loader) return;
        // sessionStorageで初回のみ表示
        if (sessionStorage.getItem('loaderShown')) {
            loader.classList.add('removed');
            startHeroSequence();
            return;
        }
        sessionStorage.setItem('loaderShown', '1');
        setTimeout(function() {
            loader.classList.add('hide');
            startHeroSequence();
            setTimeout(function() {
                loader.classList.add('removed');
            }, 900);
        }, 1200);
    }

    // ============================================
    // PREMIUM: ヒーローシーケンスアニメーション
    // ============================================
    function startHeroSequence() {
        var heroElements = document.querySelectorAll('.hero-animate');
        heroElements.forEach(function(el, i) {
            setTimeout(function() {
                el.classList.add('visible');
            }, 300 + (i * 250));
        });
    }

    // ============================================
    // PREMIUM: パララックス背景
    // ============================================
    var heroSection = document.querySelector('.hero');
    var parallaxTicking = false;

    function updateParallax() {
        if (!heroSection) return;
        var scrollY = window.scrollY;
        var heroHeight = heroSection.offsetHeight;
        if (scrollY < heroHeight) {
            heroSection.style.backgroundPositionY = (scrollY * 0.4) + 'px';
            var overlay = heroSection.querySelector('.hero-overlay');
            if (overlay) {
                overlay.style.opacity = 0.75 + (scrollY / heroHeight) * 0.25;
            }
        }
        parallaxTicking = false;
    }

    window.addEventListener('scroll', function() {
        if (!parallaxTicking) {
            window.requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    });

    // ============================================
    // PREMIUM: スクロールプログレスバー
    // ============================================
    var scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? scrollTop / docHeight : 0;
        var bar = scrollProgress.querySelector(':after') || scrollProgress;
        scrollProgress.style.setProperty('--progress', progress);
    }

    // CSS custom property approach for progress bar
    window.addEventListener('scroll', function() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? scrollTop / docHeight : 0;
        scrollProgress.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:3px;z-index:10001;pointer-events:none;';
        // Direct child style via pseudo workaround - use inline bg
        scrollProgress.style.background = 'linear-gradient(90deg, var(--primary) ' + (progress * 100) + '%, transparent ' + (progress * 100) + '%)';
    });

    // ============================================
    // PREMIUM: 画像クリップパス展開
    // ============================================
    var clipImages = document.querySelectorAll('.about-image img, .doctor-image img, .gallery-item img, .online-image img');
    clipImages.forEach(function(img) {
        img.classList.add('clip-reveal');
    });

    var clipObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                setTimeout(function() {
                    entry.target.classList.add('revealed');
                }, 200);
                clipObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.clip-reveal').forEach(function(el) {
        clipObserver.observe(el);
    });

    // ============================================
    // PREMIUM: 3Dチルトエフェクト
    // ============================================
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        var tiltCards = document.querySelectorAll('.service-card, .staff-card, .testimonial-card');
        tiltCards.forEach(function(card) {
            card.classList.add('tilt-card');

            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateX = ((y - centerY) / centerY) * -8;
                var rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
            });

            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.5s ease';
                setTimeout(function() {
                    card.style.transition = '';
                }, 500);
            });
        });
    }

    // ============================================
    // PREMIUM: ボタンリップルエフェクト
    // ============================================
    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var rect = btn.getBoundingClientRect();
            var ripple = document.createElement('span');
            ripple.classList.add('ripple');
            var size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(function() {
                ripple.remove();
            }, 700);
        });
    });

    // ============================================
    // PREMIUM: マグネティックボタン
    // ============================================
    if (!isTouchDevice) {
        var magneticBtns = document.querySelectorAll('.magnetic-btn, .nav-link--cta');
        magneticBtns.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
            });

            btn.addEventListener('mouseleave', function() {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ============================================
    // PREMIUM: 数字カウントアップ
    // ============================================
    var counterAnimated = false;
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !counterAnimated) {
                counterAnimated = true;
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    var countersSection = document.querySelector('.counters');
    if (countersSection) {
        counterObserver.observe(countersSection);
    }

    function animateCounters() {
        var counters = document.querySelectorAll('.counter-number');
        counters.forEach(function(counter) {
            var target = parseFloat(counter.getAttribute('data-target'));
            var isDecimal = target % 1 !== 0;
            var duration = 2000;
            var startTime = null;

            function easeOutExpo(t) {
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            }

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var easedProgress = easeOutExpo(progress);
                var current = easedProgress * target;

                if (isDecimal) {
                    counter.textContent = current.toFixed(1);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    if (isDecimal) {
                        counter.textContent = target.toFixed(1);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                }
            }

            requestAnimationFrame(step);
        });
    }

    // ============================================
    // PREMIUM: ページ遷移アニメーション
    // ============================================
    var pageTransition = document.getElementById('pageTransition');
    if (pageTransition) {
        // ページ読込時にフェードイン
        pageTransition.classList.add('entering');
        setTimeout(function() {
            pageTransition.classList.remove('entering');
        }, 600);

        // 内部リンククリック時にフェードアウト
        document.querySelectorAll('a[href]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href');
                // 外部リンク、アンカーリンク、tel/mailto、同一ページはスキップ
                if (!href || href.startsWith('#') || href.startsWith('tel:') ||
                    href.startsWith('mailto:') || href.startsWith('http') ||
                    href.startsWith('javascript') || link.getAttribute('target') === '_blank') {
                    return;
                }
                e.preventDefault();
                pageTransition.classList.add('active');
                setTimeout(function() {
                    window.location.href = href;
                }, 500);
            });
        });
    }

    // ============================================
    // PREMIUM: カスタムカーソル
    // ============================================
    var customCursor = document.getElementById('customCursor');
    if (customCursor && !isTouchDevice && window.innerWidth > 768) {
        customCursor.style.display = 'block';
        var cursorDot = customCursor.querySelector('.cursor-dot');
        var cursorRing = customCursor.querySelector('.cursor-ring');
        var mouseX = 0, mouseY = 0;
        var ringX = 0, ringY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursorDot) {
                cursorDot.style.left = mouseX + 'px';
                cursorDot.style.top = mouseY + 'px';
            }
        });

        // Ring follows with easing
        function animateCursorRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            if (cursorRing) {
                cursorRing.style.left = ringX + 'px';
                cursorRing.style.top = ringY + 'px';
            }
            requestAnimationFrame(animateCursorRing);
        }
        animateCursorRing();

        // Hover effect on interactive elements
        document.querySelectorAll('a, button, .btn, input, textarea, select').forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                customCursor.classList.add('hovering');
            });
            el.addEventListener('mouseleave', function() {
                customCursor.classList.remove('hovering');
            });
        });

        // Hide when leaving window
        document.addEventListener('mouseleave', function() {
            customCursor.style.opacity = '0';
        });
        document.addEventListener('mouseenter', function() {
            customCursor.style.opacity = '1';
        });
    }

    // ============================================
    // 初期化処理
    // ============================================

    updateHeader();
    toggleScrollTopButton();

    // ページ読み込み時に表示されている要素をフェードイン
    setTimeout(() => {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // ページ読み込み完了時
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        hideLoader();
    });

    // フォールバック: 3秒後にローダーを強制非表示
    setTimeout(function() {
        if (loader && !loader.classList.contains('hide')) {
            hideLoader();
        }
    }, 3000);
});

// ============================================
// Service Worker 登録
// ============================================
// Service Worker 登録
// 本番デプロイ時にコメントを解除してsw.jsを有効化してください
// 現在は開発中のため、index.htmlのインラインスクリプトで全SW解除しています
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//         navigator.serviceWorker.register('/sw.js').then(function(reg) {
//             // SW登録成功
//         }).catch(function(err) {
//             // SW登録失敗
//         });
//     });
// }

// ============================================
// グローバルエラーハンドラー
// ============================================
window.onerror = function(message, source, lineno, colno, error) {
    // 本番環境ではエラーをログに送信可能（プレースホルダー）
    // fetch('/api/log', { method: 'POST', body: JSON.stringify({ message, source, lineno }) });
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    // Promise拒否のグローバルキャッチ
    // console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// ============================================
// オプション：診療時間の動的表示
// ============================================

/**
 * 現在の曜日と時間に基づいて診療状況を表示
 * 必要に応じて使用
 */
function getClinicStatus() {
    const now = new Date();
    const day = now.getDay(); // 0: 日曜, 1: 月曜, ...
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // 診療時間の定義 (分単位)
    const morningStart = 9 * 60;    // 9:00
    const morningEnd = 13 * 60;     // 13:00
    const afternoonStart = 15 * 60; // 15:00
    const afternoonEnd = 19 * 60;   // 19:00

    // 曜日ごとの診療スケジュール
    const schedule = {
        0: { morning: false, afternoon: false }, // 日曜
        1: { morning: true, afternoon: true },   // 月曜
        2: { morning: true, afternoon: true },   // 火曜
        3: { morning: true, afternoon: false },  // 水曜
        4: { morning: false, afternoon: true },  // 木曜
        5: { morning: true, afternoon: true },   // 金曜
        6: { morning: true, afternoon: false },  // 土曜
    };

    const todaySchedule = schedule[day];

    // 午前診療中かチェック
    if (todaySchedule.morning && currentTime >= morningStart && currentTime < morningEnd) {
        return { status: 'open', message: '午前診療中 (13:00まで)' };
    }

    // 午後診療中かチェック
    if (todaySchedule.afternoon && currentTime >= afternoonStart && currentTime < afternoonEnd) {
        return { status: 'open', message: '午後診療中 (19:00まで)' };
    }

    // 休憩時間かチェック
    if (todaySchedule.morning && todaySchedule.afternoon && 
        currentTime >= morningEnd && currentTime < afternoonStart) {
        return { status: 'break', message: '休憩時間 (15:00から午後診療)' };
    }

    // 本日の診療が終了したかチェック
    if ((todaySchedule.morning || todaySchedule.afternoon) && currentTime >= afternoonEnd) {
        return { status: 'closed', message: '本日の診療は終了しました' };
    }

    // 休診日
    if (!todaySchedule.morning && !todaySchedule.afternoon) {
        return { status: 'holiday', message: '本日は休診日です' };
    }

    // 診療開始前
    return { status: 'before', message: '診療開始前 (9:00から)' };
}
