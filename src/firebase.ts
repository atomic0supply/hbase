import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCDvEXBmsLLat_4uiInMM3PC8hIbmfiljM',
  authDomain: 'hbase-ceb8a.firebaseapp.com',
  projectId: 'hbase-ceb8a',
  storageBucket: 'hbase-ceb8a.firebasestorage.app',
  messagingSenderId: '836698782513',
  appId: '1:836698782513:web:e280b7d784a5ee46788e10',
  measurementId: 'G-EXSN8MHCNX',
}

export const app = initializeApp(firebaseConfig)

// Firestore with offline persistence — the PWA keeps working offline and syncs on reconnect.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Analytics is optional and only loads where supported (not in every standalone PWA context).
analyticsSupported()
  .then((ok) => {
    if (ok) getAnalytics(app)
  })
  .catch(() => {})
