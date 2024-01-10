/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactElement, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { User } from '../../interfaces/models/user';
import { ApiStatus } from '../../interfaces/models/apistatus';
import DataTable, { Alignment, TableColumn } from 'react-data-table-component';
import { Alert, Avatar, Select } from 'antd';
import { apiRoutes } from '../../routes/api';
import http from '../../utils/http';
import { handleErrorResponse } from '../../utils';
import { Button, Form, Input } from 'antd';
import { utilService } from '../common/util';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface SalaryPeriod {
    month: number;
    year: number;
}

interface ModalProps {
    // open: boolean;
    // onClose: () => void;
    // children: ReactElement;
    user: User[];

}

export default function SalaryDisburseModal(props: ModalProps): ReturnType<FC> {

    const [salaries, setSalaries] = useState<any[]>([]);
    const [totalSalary, setTotalSalary] = useState<number>();
    const [companyBalance, setCompanyBalance] = useState<number>();
    useEffect(() => {
        getEmployeeSalary(new Date().getMonth() + 1, new Date().getFullYear());
    }, []);

    useEffect(() => {
        getCompanyBalance();
    }, []);

    const getCompanyBalance = async () => {
        const promise = http.get(apiRoutes.fetchCompanySalaryAc)
            .then((response) => {
                setCompanyBalance(response.data.balance);
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }

    const getEmployeeSalary = async (month: number, year: number) => {
        console.log("inside getEmployeeSalary");
        const userIds: number[] = props.user.map(item => item.id);
        console.log(userIds);
        const promise = http.get(apiRoutes.monthlyDetails, {
            params: {
                month: month,
                year: year,
                selectedUsers: userIds.toString()
            }
        })
            .then((response) => {
                const salaries: any[] = response.data;
                // .filter((item: any) => {
                //     const exist = props.user.find(each => each.id == item.id);
                //     if (exist && exist.id == item.id) {
                //         return item;
                //     }
                // });
                console.log(salaries);
                setSalaries(salaries);
                const salarySum: number = salaries.reduce((sum: number, obj) => {
                    return sum + ((!obj.disbursed) ? obj.salary : 0);
                }, 0);
                console.log(salarySum);
                setTotalSalary(salarySum);
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }

    const disburseSalary = () => {
        const promise = http.post(apiRoutes.disburse, salaries.filter(item => !item.disbursed))
            .then((response) => {
                console.log(response.data);
                if (response.data.jobDone) {
                    utilService.successToast(response.data.msg);
                } else {
                    utilService.warnToast(response.data.msg);
                }
                getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
                getCompanyBalance();
            })
            .catch((error) => {
                handleErrorResponse(error);
            });
        toast.promise(promise, {
            pending: "Disbursing salary",
        });
    }

    const validateMonth = (_: any, value: number) => {
        if (!value || value < 1 || value > 12) {
            return Promise.reject('Month must be 1 to 12');
        }
        getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
        return Promise.resolve();
    };

    const validateYear = (_: any, value: number) => {
        if (!value || value < 2023 || value > 2024) {
            return Promise.reject('Invalid year');
        }
        getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
        return Promise.resolve();
    };

    const onSubmit = (values: SalaryPeriod) => {
        console.log("Inside disburse: ");
        console.log(values);
        const date = new Date();
        if (values.year < date.getFullYear() || (values.month <= (date.getMonth() + 1) && values.year == date.getFullYear())) {
            console.log("Proceed to disburse");
            disburseSalary();
        } else {
            console.log("Invalid month-year combination");
            utilService.warnToast("Invalid month-year combination");
        }
    }
    const [form] = Form.useForm();
    const salaryTableColumn: TableColumn<any>[] = [
        {
            name: "Name",
            cell: (row) => {
                return <span>{" " + row.firstName + " " + row.lastName}</span>;
            }
        },
        {
            name: "Employee Id",
            selector: (row) => row.id,
            center: true
        },
        {
            name: "Rank",
            selector: (row) => row.rank,
            center: true,
            sortable: true,
        },
        {
            name: "Salary",
            selector: (row) => row.salary,
            center: true,
        },
        {
            name: "Payment Status",
            selector: (row) => (row.disbursed) ? 'Paid' : 'Unpaid',
            center: true,
        }
    ]
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    const [selectedMonth, setSelectedMonth] = useState(0);
    const handleMonthChange = (e: number) => {
        console.log(e);
        setSelectedMonth(e);
        form.setFieldValue("month", e + 1);
        console.log(form.getFieldsValue());
    };
    const years = [
        2023, 2024
    ];
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const handleYearChange = (e: number) => {
        console.log(e);
        setSelectedYear(e);
        form.setFieldValue("year", e);
        console.log(form.getFieldsValue());
    };
    return (
        <div>
            <Form
                className="space-y-4 md:space-y-6"
                form={form}
                name="salary"
                // onFinish={onSubmit}
                layout={'horizontal'}
                requiredMark={false}
                initialValues={
                    {
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                    }
                }
            >
                <div className='flex mt-4'>
                    <Form.Item
                        name="month"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Month</p>
                        }
                        rules={[
                            {
                                required: true,
                                validator: validateMonth
                            }
                        ]}
                    >
                        <div className="w-72">
                            <Select label="Select Version" variant="outlined" id="monthSelect" value={selectedMonth} onChange={handleMonthChange}>
                                <option value="" disabled>Select Month</option>
                                {months.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="year"
                        label={
                            <p className="block text-sm font-medium text-gray-900 ml-10">
                                Year
                            </p>
                        }
                        rules={[
                            {
                                required: true,
                                validator: validateYear
                            }
                        ]}
                    >
                        <div className="w-72">
                            <Select label="Select Version" variant="outlined" id="yearSelect" value={selectedYear} onChange={handleYearChange}>
                                <option value="" disabled>Select Year</option>
                                {years.map((year, index) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </Form.Item>
                </div>

            </Form>

            <DataTable subHeader subHeaderAlign={Alignment.LEFT} subHeaderComponent={<div className='text-sm'><h1 className='pb-2 block text-sm font-medium text-gray-900'>Total payable salary:   {totalSalary}</h1><h1 className='pb-2 block text-sm font-medium text-gray-900'>Company balance:   {companyBalance}</h1><h1 className='block text-sm font-medium text-gray-900'>Projected balance after disbursement:   {(companyBalance && totalSalary) ? companyBalance - totalSalary : 0}</h1></div>} columns={salaryTableColumn} data={salaries} />
            <div className="text-center pt-10">
                <Button
                    className="bg-primary"
                    block
                    // loading={loading}
                    type="primary"
                    size="large"
                    // htmlType={'submit'}
                    onClick={(key) => onSubmit(form.getFieldsValue())}
                >
                    Disburse
                </Button>
            </div>
        </div>
    );
}
