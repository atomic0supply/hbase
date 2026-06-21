# Reparto del Hogar

Reparto justo de tareas para dos, con marcador, racha y recompensas. PWA para iOS construida con **React + TypeScript + Vite** y **Firebase** (Auth con Google + Firestore en tiempo real). La pareja se empareja con un **código de 6 caracteres / QR**.

Implementa el diseño original de Claude Design (`Reparto del Hogar.dc.html`).

## Stack

- **React 18 + TypeScript + Vite 6**
- **Firebase**: Authentication (Google) y Cloud Firestore (sincronización en tiempo real + caché offline)
- **PWA**: `vite-plugin-pwa` (service worker con Workbox, instalable en iOS)
- **QR**: `qrcode` (generar) y `@zxing/browser` (escanear con la cámara, carga diferida)

## Cómo funciona

1. **Entrar con Google** (Firebase Auth).
2. **Crear hogar** (te conviertes en persona A y obtienes un código + QR) o **Unirte** al hogar de tu pareja escaneando el QR o escribiendo el código.
3. Todo (tareas, completados, recompensas, nombres) vive en un único documento `households/{id}` que ambos comparten y se sincroniza al instante.

Pantallas: **Hoy** (anillo de progreso + tareas del día por persona), **Hogar** (planta-salud, racha cooperativa, marcador semanal, recompensas, medallas) y **Organizar** (nombres, emparejamiento, CRUD de tareas y recompensas).

## Modelo de datos (Firestore)

- `users/{uid}` → `{ householdId, displayName, photoURL }` — privado de cada usuario.
- `households/{hid}` → `{ members[], memberSlots, people{a,b}, tasks[], rewards[], completions{}, inviteCode, createdBy, ... }` — estado compartido de la pareja.
- `invites/{code}` → `{ householdId, slot, createdBy, createdAt }` — el código es el secreto que permite unirse; se consume al emparejar.

Las reglas de seguridad están en [`firestore.rules`](firestore.rules): solo los miembros leen/escriben su hogar; unirse exige un código de invitación válido; máximo 2 personas por hogar.

---

## Puesta en marcha (local)

```bash
npm install
npm run dev      # http://localhost:5173
```

## Configuración de Firebase (¡pasos manuales obligatorios!)

El código ya apunta al proyecto **`hbase-ceb8a`**. Para que el login y la base de datos funcionen, en la [consola de Firebase](https://console.firebase.google.com/project/hbase-ceb8a):

1. **Authentication → Sign-in method →** habilita **Google**.
2. **Authentication → Settings → Authorized domains →** asegúrate de tener `localhost`, `hbase-ceb8a.web.app` y `hbase-ceb8a.firebaseapp.com` (los dos últimos vienen por defecto).
3. **Firestore Database →** crea la base de datos (modo producción, la región que prefieras).
4. Despliega las reglas de seguridad:
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

## Despliegue (Firebase Hosting)

```bash
npm run deploy            # build + deploy de hosting y reglas
# o por partes:
npm run deploy:hosting    # solo la app
npm run deploy:rules      # solo firestore.rules
```

La app quedará en `https://hbase-ceb8a.web.app`.

## Instalar en iOS

Abre la URL en **Safari** → Compartir → **Añadir a pantalla de inicio**. Se abre a pantalla completa (standalone). La cámara para escanear el QR requiere **iOS 16.4+**; el código manual funciona siempre.

## Notificaciones push (iOS)

Notificaciones para: **tareas pendientes** (recordatorio diario a la hora elegida), **rachas** (hitos y aviso de racha en riesgo) y **tareas nuevas** que añade tu pareja.

**Cómo funciona:** Web Push estándar (VAPID) + Service Worker propio (`src/sw.ts`). El cliente guarda su suscripción en `users/{uid}`; las **Cloud Functions** (`functions/`) deciden a quién avisar y envían con `web-push`:

- `dailyReminder` — programada cada hora; dispara a `reminderHour` (zona horaria de cada usuario) si quedan tareas hoy o la racha está en riesgo.
- `onHouseholdChange` — trigger de Firestore: avisa a la pareja de una tarea nueva y celebra hitos de racha (3, 7, 14, 30, 60, 90, 180, 365).

**Requisitos iOS:** iOS 16.4+ y la app **instalada en la pantalla de inicio**. El permiso se pide desde Organizar › Notificaciones (requiere un toque). En Safari (pestaña) no hay push.

### Puesta en marcha de las notificaciones (una vez)

1. **Plan Blaze** activado en el proyecto (las Functions lo requieren; a esta escala el coste es ~0 €).
2. **Claves VAPID**: ya generadas. La pública está en `src/lib/push.ts` y `functions/src/lib/push.ts`; la privada se guarda como secreto:
   ```bash
   firebase functions:secrets:set VAPID_PRIVATE_KEY   # pega la clave privada
   ```
3. **Desplegar las funciones**:
   ```bash
   cd functions && npm install && cd ..
   firebase deploy --only functions --force
   ```
   > La primera vez, GCP tarda unos minutos en propagar permisos de Eventarc/Cloud Build. Si falla, espera 3-5 min y reintenta. Requiere rol **Owner** en el proyecto para asignar los roles a los *service agents*.

### Probar
Instala la PWA en un iPhone (16.4+), entra, ve a **Organizar › Notificaciones › Activar**, acepta el permiso. Para forzar el recordatorio, pon `reminderHour` a la hora actual; la función corre cada hora en punto.

## Scripts

| Script | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción (`dist/`) |
| `npm run preview` | Sirve el build localmente |
| `npm run typecheck` | Solo comprobación de tipos |
| `npm run deploy` | Build + `firebase deploy` |

## Estructura

```
src/
  firebase.ts            init de Firebase (Auth + Firestore offline)
  types.ts               modelo de datos
  lib/
    defaults.ts          tareas/recompensas por defecto, constantes
    logic.ts             port de la lógica del diseño (weekAssign, plantInfo, computeModel…)
    household.ts         Firestore: crear/unir hogar, suscribir, mutar
    celebrate.ts         confetti + chime al completar el día
    push.ts              suscripción Web Push (VAPID) + preferencias
  hooks/
    useAuth.ts           estado de sesión + login Google
    useHousehold.ts      suscripción en tiempo real al hogar
  components/            Login, Pairing, QrScanner, QrImage, NotificationsCard, las 3 vistas y los sheets
  sw.ts                  service worker propio (precache + push + notificationclick)
  App.tsx                orquestación: auth → emparejamiento → app

functions/               Cloud Functions (push)
  src/index.ts           dailyReminder (programada) + onHouseholdChange (trigger)
  src/lib/logic.ts       porte server-side de la lógica (zona horaria-aware)
  src/lib/push.ts        envío con web-push + poda de suscripciones muertas
```

> El bundle del diseño original está en `Reparto del Hogar gamificado-handoff/` (ignorado por git).
