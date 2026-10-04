/**
 * TEMP — remove when Command Center auth is fixed.
 * Allows route + UI access without login (API calls may still require a session).
 */
export const isCommandCenterOpenAccessEnabled =
  import.meta.env.DEV || import.meta.env.VITE_COMMAND_CENTER_OPEN_ACCESS === 'true';
