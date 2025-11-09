import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { saveWorkspace } from './utils/storage';
import App from './App';

// Debounced save to localStorage
let saveTimeout: number | null = null;
store.subscribe(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = window.setTimeout(() => {
    const state = store.getState();
    saveWorkspace({
      items: state.workspace.items,
    });
  }, 500);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

