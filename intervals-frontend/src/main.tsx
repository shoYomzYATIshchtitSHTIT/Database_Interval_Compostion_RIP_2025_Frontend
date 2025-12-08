import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App.tsx'
import { registerSW } from "virtual:pwa-register"
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

if ("serviceWorker" in navigator) {
    registerSW()
}


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>

        </Provider>
    </React.StrictMode>,
)