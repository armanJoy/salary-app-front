import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import ErrorPage from '../components/errorPage';
import Layout from '../components/layout';
import Redirect from '../components/layout/Redirect';
import NotFoundPage from '../components/notfoundPage';
import { webRoutes } from './web';
import loadable from '@loadable/component';
import ProgressBar from '../components/loader/progressBar';
import RequireAuth from './requireAuth';
import Login from '../components/auth/Login';
import About from '../components/demo-pages/about';

const errorElement = <ErrorPage />;
const fallbackElement = <ProgressBar />;

const Employee = loadable(() => import('../components/employee/employee'), {
    fallback: fallbackElement,
});

export const browserRouter = createBrowserRouter([
    {
        path: webRoutes.home,
        element: <Redirect />,
        errorElement: errorElement,
    },
    {
        element: <AuthLayout />,
        errorElement: errorElement,
        children: [
            {
                path: webRoutes.login,
                element: <Login />,
            },
        ],
    },

    // protected routes
    {
        element: (
            <RequireAuth>
                <Layout />
            </RequireAuth>
        ),
        errorElement: errorElement,
        children: [
            {
                path: webRoutes.users,
                element: <Employee />,
            },
            {
                path: webRoutes.about,
                element: <About />,
            },
        ],
    },

    // 404
    {
        path: '*',
        element: <NotFoundPage />,
        errorElement: errorElement,
    },
]);
