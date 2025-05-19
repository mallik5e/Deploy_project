import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import BookingContextProvider from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <BookingContextProvider>
      <App />
  </BookingContextProvider>
)
