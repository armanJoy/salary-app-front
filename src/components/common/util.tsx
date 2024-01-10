import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


export const utilService = {
    successToast: (msg: string) => {
        toast.success(msg, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 2000,
            hideProgressBar: true
        });
    },
    errorToast: (msg: string) => {
        toast.error(msg, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 2000,
            hideProgressBar: true
        });
    },
    warnToast: (msg: string) => {
        toast.warn(msg, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 2000,
            hideProgressBar: true
        });
    },
    infoToast: (msg: string) => {
        toast.info(msg, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 2000,
            hideProgressBar: true
        });
    }
}
