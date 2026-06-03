export type AppEnv = 'dev' | 'staging' | 'prod';

/**
 * Single source of truth for the web environment. `VITE_APP_ENV` is baked in
 * at build time per docker-compose service (staging → "staging", prod →
 * "prod"); falls back to "dev" for the local `vite dev` server.
 */
export const APP_ENV: AppEnv = (() => {
    const e = import.meta.env.VITE_APP_ENV as string | undefined;
    if (e === 'staging' || e === 'dev' || e === 'prod') return e;
    return import.meta.env.DEV ? 'dev' : 'prod';
})();

export const IS_PROD = APP_ENV === 'prod';
