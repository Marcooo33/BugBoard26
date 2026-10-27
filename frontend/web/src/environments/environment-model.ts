import { InjectionToken } from "@angular/core";

export const ENVIRONMENT_TOKEN = new InjectionToken<Environment>('Environment');

export interface Environment {
    showcase?: boolean;
    urls: {
        api: string;
    };
}

