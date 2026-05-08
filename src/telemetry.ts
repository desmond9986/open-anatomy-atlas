import { inject, track } from '@vercel/analytics';

type TelemetryLevel = 'info' | 'warn' | 'error';
type TelemetryPropertyValue = string | number | boolean | null | undefined;
type TelemetryProperties = Record<string, TelemetryPropertyValue>;

const LOG_PREFIX = '[OpenAnatomyAtlas]';

function cleanedProperties(properties: TelemetryProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean | null>;
}

function writeLog(level: TelemetryLevel, event: string, properties?: TelemetryProperties) {
  const payload = {
    event,
    ...cleanedProperties(properties),
    timestamp: new Date().toISOString()
  };

  console[level](`${LOG_PREFIX} ${event}`, payload);
}

export function initializeTelemetry() {
  inject();
  writeLog('info', 'App Started', {
    mode: import.meta.env.MODE,
    production: import.meta.env.PROD
  });
}

export function logViewerEvent(event: string, properties?: TelemetryProperties) {
  const cleaned = cleanedProperties(properties);
  writeLog('info', event, cleaned);
  track(event, cleaned);
}

export function logViewerWarning(event: string, properties?: TelemetryProperties) {
  writeLog('warn', event, properties);
}

export function logViewerError(event: string, error: unknown, properties?: TelemetryProperties) {
  const message = error instanceof Error ? error.message : String(error);
  writeLog('error', event, {
    ...properties,
    error: message
  });
}
