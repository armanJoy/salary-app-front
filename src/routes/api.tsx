import { API_URL } from '../utils';

export const apiRoutes = {
    login: `${API_URL}/user/login`,
    logout: `${API_URL}/user/logout`,
    createUser: `${API_URL}/user/create`,
    updateUser: `${API_URL}/user/update`,
    employeeInfo: `${API_URL}/user/employee`,
    users: `${API_URL}/user/employees`,
    deleteEmployee: `${API_URL}/user/remove`,
    fetchBasicSalary: `${API_URL}/salary/get-basic-salary`,
    updateBasicSalary: `${API_URL}/salary/basic-salary`,
    fetchCompanySalaryAc: `${API_URL}/salary/get-company-balance`,
    updateCompanySalaryAc: `${API_URL}/salary/company-balance`,
    empSalary: `${API_URL}/salary/detail`,
    salaries: `${API_URL}/salary/employee-salary`,
    monthlyDetails: `${API_URL}/salary/monthly-details`,
    disburse: `${API_URL}/salary/disburse`,
    payDue: `${API_URL}/salary/pay-due`,
};
