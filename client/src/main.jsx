import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import global_en from "./translations/en/global.json"
import global_tig from "./translations/tig/global.json"
import global_am from "./translations/am/global.json"
import i18next from "i18next"
import { I18nextProvider } from 'react-i18next'

i18next.init({
  interpolatation :{escapeValue:true},
  lng:"en",
  resources:{
    en:{
      global:global_en
    },
    tig:{
      global:global_tig
    },
    am:{
      global:global_am
    }
  }
})
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>

    <App />
    </I18nextProvider>
  </React.StrictMode>,
)
