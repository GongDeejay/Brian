import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './i18n';
import { AuthProvider } from './context/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* I18n wraps the error boundary so the crash screen also honours the
        participant's selected language. Auth sits inside i18n so account UI can
        be translated, and outside the boundary so a crash in either is caught. */}
    <I18nProvider>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
