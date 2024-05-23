import { Route, Routes } from "react-router-dom"
import { routerConfig } from "src/configs/routes"
import { Suspense, useEffect } from "react"
import { useAppDispatch } from "src/hooks/redux-hooks"
import { setCurrentUser } from "src/store/reducers/userSlice"

const RouteProvider = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch(setCurrentUser(user));
        }
    }, [dispatch]);

    return (
        <Routes>
            {
                routerConfig.map(({path, element}) =>
                    <Route
                        path={path}
                        element={<Suspense fallback={<p>Loading...</p>}> {element} </Suspense>}
                        key={path}/>
                )
            }
        </Routes>
    )
}

export {RouteProvider as AppRouter}