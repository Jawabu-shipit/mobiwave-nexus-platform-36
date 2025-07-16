/**
 * Service Worker Registration
 * 
 * This module handles the registration and management of the service worker
 * for offline capabilities, caching, and push notifications.
 */

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

/**
 * Register the service worker
 */
export function register() {
  if (isServiceWorkerSupported) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      registerValidSW(swUrl);
    });
  }
}

/**
 * Register the service worker with the given URL
 */
function registerValidSW(swUrl: string) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      // Successfully registered
      console.log('Service Worker registered with scope:', registration.scope);

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; notify the user
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // Dispatch an event that can be caught by the application to show a notification
              window.dispatchEvent(new CustomEvent('swUpdate'));
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Unregister the service worker
 */
export function unregister() {
  if (isServiceWorkerSupported) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error);
      });
  }
}

/**
 * Check for service worker updates
 */
export function checkForUpdates() {
  if (isServiceWorkerSupported) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.update();
      })
      .catch(error => {
        console.error('Error checking for service worker updates:', error);
      });
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
  if (!isServiceWorkerSupported) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push manager is supported
    if (!registration.pushManager) {
      console.log('Push notifications not supported');
      return null;
    }

    // Get permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This should be your VAPID public key
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      )
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Convert a base64 string to a Uint8Array for the applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Enable background sync for offline operations
 */
export async function registerBackgroundSync(syncTag: string) {
  if (!isServiceWorkerSupported) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if sync is supported
    if ('sync' in registration) {
      await (registration as any).sync.register(syncTag);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
}

/**
 * Register for periodic background sync
 */
export async function registerPeriodicSync(syncTag: string, minInterval: number) {
  if (!isServiceWorkerSupported) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if periodic sync is supported
    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any,
      });
      
      if (status.state === 'granted') {
        await (registration as any).periodicSync.register(syncTag, {
          minInterval, // in milliseconds
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error registering periodic background sync:', error);
    return false;
  }
}