import { classNames } from "./helpers/classNames"
import { useTheme } from "./hooks/useTheme";
import { AppRouter } from "./providers/RouteProvider"
import './styles/index.scss';


function App() {
  const { theme } = useTheme(); 

  return (
    <div className={classNames('', {}, [theme])}>
				<AppRouter/>
        <div id="portal-root"></div>
		</div>
  )
}

export default App