
// Script loaded!
var cacheStorageKey = 'notes-1'

var cacheList = [
  '/',
  "index.html",
  "favicon.svg",
]

self.addEventListener('install', function(e) {
  // Cache event!
  e.waitUntil(
    caches.open(cacheStorageKey).then(function(cache) {
      // Adding to Cache: cacheList
      return cache.addAll(cacheList)
    }).then(function() {
      // Skip waiting!
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', function(e) {
  // Activate event
  e.waitUntil(
    Promise.all(
      caches.keys().then(cacheNames => {
        return cacheNames.map(name => {
          if (name !== cacheStorageKey) {
            return caches.delete(name)
          }
        })
      })
    ).then(() => {
      // Clients claims.'
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', function(e) {
  // // Fetch event: e.request.url
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        // Using cache for: e.request.url
        return response
      }
      // Fallback to fetch: e.request.url
      return fetch(e.request.url)
    })
  )
})
