import { AxiosError } from 'axios';
import { toast } from 'sonner';

export const API_URL = `http://localhost:9090/v1`;

export enum NotificationType {
    ERROR = 'error',
    SUCCESS = 'success',
}

export const setPageTitle = (title: string) => {
    window.document.title = title;
};

export const showNotification = (
    message = 'Something went wrong',
    type: NotificationType = NotificationType.ERROR,
    description?: string
) => {
    toast[type](message, {
        description: description,
    });
};

export const handleErrorResponse = (
    error: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    callback?: () => void,
    errorMessage?: string
) => {
    console.error(error);

    if (!errorMessage) {
        const errorMsg: string = (error.response.data.msg) ? error.response.data.msg : error.response.data.message;
        errorMessage = (errorMsg) ? errorMsg : 'Something went wrong';


        if (typeof error === 'string') {
            try {
                error = JSON.parse(error);
            } catch (error) {
                // do nothing
            }
        }

        if (error instanceof AxiosError && error?.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error?.message) {
            errorMessage = error.message;
        }
    }

    showNotification(
        errorMessage &&
        errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
        NotificationType.ERROR
    );

    if (callback) {
        return callback();
    }
};
