import { sendAlertEmail } from '../src/utils/mailer.js';

const STATUS_URL = process.env.MONITOR_URL ?? 'http://localhost:3000/status';
const INTERVAL_MS = 30_000;
const RESPONSE_TIME_ALERT_MS = 3000;
const CONSECUTIVE_FAILURES_ALERT = 2;

let consecutiveFailures = 0;
let alertSentForCurrentOutage = false;

async function checkOnce() {
  const start = Date.now();
  try {
    const res = await fetch(STATUS_URL, { signal: AbortSignal.timeout(5000) });
    const duration = Date.now() - start;
    const body = await res.json();

    if (!res.ok) {
      consecutiveFailures++;
      logAlert(`Service dégradé (HTTP ${res.status}) : ${JSON.stringify(body.checks)}`);
    } else {
      if (alertSentForCurrentOutage) {
        await sendAlertEmail(
          'Service rétabli',
          `Le service répond à nouveau normalement depuis ${new Date().toISOString()}.`
        );
      }
      consecutiveFailures = 0;
      alertSentForCurrentOutage = false;
      console.log(`[${new Date().toISOString()}] OK (${duration}ms)`);
    }

    if (duration > RESPONSE_TIME_ALERT_MS) {
      logAlert(`Temps de réponse anormalement élevé : ${duration}ms (seuil : ${RESPONSE_TIME_ALERT_MS}ms)`);
    }
  } catch (error) {
    consecutiveFailures++;
    logAlert(`Service injoignable : ${error instanceof Error ? error.message : String(error)}`);
  }

  if (consecutiveFailures >= CONSECUTIVE_FAILURES_ALERT && !alertSentForCurrentOutage) {
    alertSentForCurrentOutage = true;
    logAlert(`ALERTE : ${consecutiveFailures} échecs consécutifs`);
    await sendAlertEmail(
      'Alerte service indisponible',
      `${consecutiveFailures} échecs consécutifs détectés.\nDernière vérification : ${new Date().toISOString()}\nURL surveillée : ${STATUS_URL}`
    );
  }
}

function logAlert(message: string) {
  console.error(`[${new Date().toISOString()}] [ALERTE] ${message}`);
}

console.log(`Supervision démarrée, sonde toutes les ${INTERVAL_MS / 1000}s sur ${STATUS_URL}`);
setInterval(checkOnce, INTERVAL_MS);
checkOnce();