// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';
import { SocketContextProvider } from './context/SocketContext'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SocketContextProvider> {/* Wrap App with the context provider */}
          <App />
        </SocketContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);