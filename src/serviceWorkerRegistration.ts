export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      // Only attempt to use the real service worker in production
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register(swUrl).then(
          (registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          },
          (error) => {
            console.error('Service Worker registration failed:', error);
          }
        );
      } else {
        // In development, use a simpler approach
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('Development Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.error('Development Service Worker registration failed:', error);

            // Add more detailed diagnostic information
            if (error.name === 'SecurityError') {
              console.info(
                'Security Error: This could be due to using self-signed certificates. ' +
                  'Try running Chrome with --ignore-certificate-errors flag'
              );
            }
          });
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
