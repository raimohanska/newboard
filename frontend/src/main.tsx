import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/w/:workspaceId" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
);

