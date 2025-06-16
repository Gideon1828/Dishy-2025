import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import ThemeProvider from './context/ThemeContext';
import './Index.css'
import App from './App.jsx';
import './i18n'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
)
