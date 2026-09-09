```javascript
const CACHE_NAME = "fieldhub-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];


/* ================= INSTALL ================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(cache => {

          return cache.addAll(
            APP_FILES
          );

        })

    );

    self.skipWaiting();

  }
);


/* ================= ACTIVATE ================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(cacheNames => {

          return Promise.all(

            cacheNames
              .filter(
                name =>
                  name !== CACHE_NAME
              )
              .map(
                name =>
                  caches.delete(name)
              )
          );

        })

    );

    self.clients.claim();

  }
);


/* ================= FETCH ================= */

self.addEventListener(
  "fetch",
  event => {

    /*
      Navigation requests:
      Try network first, then cached app.
    */

    if (
      event.request.mode ===
      "navigate"
    ) {

      event.respondWith(

        fetch(event.request)
          .then(response => {

            const copy =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              });

            return response;

          })

          .catch(() => {

            return caches.match(
              event.request
            );

          })

      );

      return;
    }


    /*
      Other files:
      Try cache first, then network.
    */

    event.respondWith(

      caches.match(
        event.request
      )
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(
          event.request
        )
        .then(response => {

          if (
            !response ||
            response.status !== 200
          ) {
            return response;
          }

          const copy =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                copy
              );

            });

          return response;

        });

      })

    );

  }
);
```
