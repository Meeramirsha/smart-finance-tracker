import { ApplicationConfig, provideBrowserGlobalErrorListeners, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' }
  ]
};
