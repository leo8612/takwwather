self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("waterapp-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./app.js"
      ]);
    })
  );
});