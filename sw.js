const VER = 'slideshow-v8';
const CACHE = 'slideshow-' + VER;
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 安装：预缓存核心文件
self.addEventListener('install', e => {
  e.waitUntil(
    缓存.打开(CACHE).然后(c => c.addAll(ASSETS))
  );
  self.skipWaiting();   // 强制跳过 waiting，立即激活
});

// 激活：删除旧缓存 + 立即接管所有页面
self.addEventListener('activate', e => {
  e.waitUntil(
    缓存.键().然后(键 =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).然后(() => self.clients.claim())   // 立即控制当前页面
  );
});

// 请求拦截：HTML 永远走网络，其他资源缓存优先
self.addEventListener('fetch', e => {
  const req = e.request;
  // HTML 页面：Network First，保证永远是最新的
  如果 (req.destination === 'document' || req.url.endsWith('.html')) {
    e.respondWith(
      获取(req).捕获(() => 缓存.匹配(req))
    );
    返回;
  }
  // 其他资源（JS/CSS/图片等）：缓存优先，离线也能用
  e.respondWith(
    caches.match(req).then(r => r || fetch(req))
  );
});
