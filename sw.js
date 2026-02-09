/**
 * こころのクリニック - Service Worker
 * オフライン対応・キャッシュ戦略
 */
'use strict';

const CACHE_NAME = 'kokoro-clinic-v2';
const OFFLINE_URL = '/404.html';

// プリキャッシュするリソース
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/images/hero-bg.jpg',
    '/images/about-clinic.jpg',
    '/images/doctor-yamada.jpg',
    '/images/staff-nurse.jpg',
    '/images/staff-psychologist.jpg',
    '/images/staff-receptionist.jpg',
    '/images/gallery-waiting.jpg',
    '/images/gallery-exam.jpg',
    '/images/gallery-reception.jpg',
    '/images/gallery-exterior.jpg',
    '/images/gallery-hallway.jpg',
    '/images/service-counseling.jpg',
    '/manifest.json',
    '/images/favicon.svg',
    '/404.html'
];

// インストール: プリキャッシュ
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// アクティベート: 古いキャッシュの削除
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// フェッチ: ネットワークファースト + キャッシュフォールバック
self.addEventListener('fetch', function(event) {
    // POSTリクエストはスキップ
    if (event.request.method !== 'GET') return;

    // 外部リソース（Google Fonts等）はキャッシュファースト
    if (event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                return fetch(event.request).then(function(response) {
                    if (response.ok) {
                        var responseClone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                }).catch(function() {
                    return new Response('', { status: 408, statusText: 'Offline' });
                });
            })
        );
        return;
    }

    // HTMLページ: ネットワークファースト
    if (event.request.headers.get('Accept') &&
        event.request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request).then(function(response) {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function() {
                return caches.match(event.request).then(function(cached) {
                    return cached || caches.match(OFFLINE_URL);
                });
            })
        );
        return;
    }

    // その他のリソース: キャッシュファースト
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                if (response.ok) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});
