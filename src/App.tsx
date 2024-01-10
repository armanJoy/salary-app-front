import { RouterProvider } from 'react-router-dom';
import { browserRouter } from './routes/browserRouter';
import { ToastContainer } from 'react-toastify';

function App() {
    return (
        <div className="fade-in">
            <RouterProvider router={browserRouter} />
            <ToastContainer />
        </div>
    );
}

export default App;
