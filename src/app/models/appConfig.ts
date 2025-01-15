export interface AppConfig {
  backendHost: string;
}

export function getDefaultAppConfig(): AppConfig {
  return {
    backendHost: 'http://localhost:8080',
  };
}
