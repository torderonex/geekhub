import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from 'src/App.tsx'
import 'src/styles/index.scss'
import { setupStore } from 'src/store/store'
import { BrowserRouter } from 'react-router-dom'
import ThemeProvider from './components/theme-provider/ThemeProvider'
import 'src/configs/i18n'

const store = setupStore()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
     <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
     </Provider>
  </BrowserRouter>
)