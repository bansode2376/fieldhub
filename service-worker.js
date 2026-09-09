```javascript
const CACHE_NAME = "fieldhub-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];


/* ================= INSTALL ================= */

self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_FILES);
      })
  );

  self.skipWaiting();

});


/* ================= ACTIVATE ================= */

self.addEventListener("activate", function (event) {

  event.waitUntil(

    caches.keys().then(function (cacheNames) {

      return Promise.all(

        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })

      );

    })

  );

  self.clients.claim();

});


/* ================= FETCH ================= */

self.addEventListener("fetch", function (event) {

  if (event.request.method !== "GET") {
    return;
  }


  event.respondWith(

    caches.match(event.request)

      .then(function (cachedResponse) {

        if (cachedResponse) {
          return cachedResponse;
        }


        return fetch(event.request)

          .then(function (networkResponse) {

            if (
              !networkResponse ||
              networkResponse.status !== 200
            ) {
              return networkResponse;
            }


            const responseCopy =
              networkResponse.clone();


            caches.open(CACHE_NAME)
              .then(function (cache) {

                cache.put(
                  event.request,
                  responseCopy
                );

              });


            return networkResponse;

          })

          .catch(function () {

            return caches.match("./index.html");

          });

      })

  );

});
```
