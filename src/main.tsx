import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/router';
import { ErrorBoundary } from './app/ErrorBoundary';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('缺少 #root 挂载点');

// 部署在子路径时（GitHub Pages：/codevision-lab/）设置 Router basename；
// 开发模式 BASE_URL 为 '/'，无 basename。
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter basename={routerBasename === '' ? undefined : routerBasename}>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
