export interface AppConfig {
  backendHost: string;
  websocketHost: string;
}

export function getDefaultAppConfig(): AppConfig {
  return {
    backendHost: 'http://localhost:8080',
    websocketHost: 'localhost:8080'
  };
}

