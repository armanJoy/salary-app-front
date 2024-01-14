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

interface FormValues {
    basicSalary: number;
    newBalance: number;
}

interface ModalProps {
    flag: number;
}

export default function SalaryDisburseModal(props: ModalProps): ReturnType<FC> {

    const [basicSalary, setBasicSalary] = useState<number>();
    const [companyBalance, setCompanyBalance] = useState<number>();

    useEffect(() => {
        getBasicSalary();
    }, [basicSalary]);

    useEffect(() => {
        getCompanyBalance();
    }, [companyBalance]);

    const getBasicSalary = async () => {
        const promise = http.get(apiRoutes.fetchBasicSalary)
            .then((response) => {
                console.log(response.data);
                setBasicSalary(response.data.balance);
                form.setFieldValue("basicSalary", response.data.balance);
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }

    const updateBasicSalary = () => {
        console.log(form.getFieldValue("basicSalary"));
        const promise = http.patch(apiRoutes.updateBasicSalary + "?newBasicSalary=" + form.getFieldValue("basicSalary"))
            .then((response) => {
                console.log(response.data);
                if (response.data.jobDone) {
                    utilService.successToast(response.data.msg);
                    setBasicSalary(response.data.balance);
                    form.setFieldValue("basicSalary", 0);
                } else {
                    utilService.warnToast(response.data.msg);
                }
            })
            .catch((error) => {
                handleErrorResponse(error);
            });
        toast.promise(promise, {
            pending: "Updating basic salary",
        });
    }

    const getCompanyBalance = async () => {
        const promise = http.get(apiRoutes.fetchCompanySalaryAc)
            .then((response) => {
                console.log(response.data);
                setCompanyBalance(response.data.balance);
                form.setFieldValue("newBalance", 0);
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }


    const updateCompanyBalance = () => {
        console.log(form.getFieldValue("newBalance"));
        const promise = http.patch(apiRoutes.updateCompanySalaryAc + "?newBalance=" + form.getFieldValue("newBalance"))
            .then((response) => {
                console.log(response.data);
                if (response.data.jobDone) {
                    utilService.successToast(response.data.msg);
                    setCompanyBalance(response.data.balance);
                    form.setFieldValue("newBalance", response.data.balance);
                } else {
                    utilService.warnToast(response.data.msg);
                }
            })
            .catch((error) => {
                const errorMsg = (error.response.data.msg) ? error.response.data.msg : error.response.data.message;
                utilService.warnToast(errorMsg);
                handleErrorResponse(error);
            });
        toast.promise(promise, {
            pending: "Updating basic salary",
        });
    }


    const [form] = Form.useForm();
    return (
        <div className='mt-5'>
            <h1 style={{ display: (props.flag == 2) ? 'none' : '' }} className="block text-sm font-medium text-gray-900 ">Current Basic Salary: {basicSalary}</h1>
            <h1 style={{ display: (props.flag == 1) ? 'none' : '' }} className="block text-sm font-medium text-gray-900">Current Company Balance: {companyBalance}</h1>
            <Form
                className="space-y-4 md:space-y-6 mt-10"
                form={form}
                name="salary"
                // onFinish={onSubmit}
                layout={'horizontal'}
                requiredMark={false}
                initialValues={
                    {
                        basicSalary: basicSalary,
                        newBalance: companyBalance,
                    }
                }
            >
                <div className='flex mt-4'>
                    <Form.Item hidden={props.flag == 2}
                        name="basicSalary"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Basic Salary</p>
                        }
                    >
                        <Input placeholder="" value={basicSalary} type='number' className="bg-gray-50 text-gray-900 sm:text-sm py-1.5" />
                    </Form.Item>
                    <Form.Item hidden={props.flag == 1}
                        name="newBalance"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Add-up Balance</p>
                        }
                    >
                        <Input placeholder="" type='number' value={companyBalance} className="bg-gray-50 text-gray-900 sm:text-sm py-1.5" />
                    </Form.Item>
                </div>

            </Form >
            <div className="text-center pt-10">
                <Button
                    className="bg-primary"
                    block
                    // loading={loading}
                    type="primary"
                    size="large"
                    // htmlType={'submit'}
                    onClick={(key) => props.flag == 1 ? updateBasicSalary() : updateCompanyBalance()}
                >
                    {(props.flag == 1) ? 'Update Basic Salary' : 'Update Company Balance'}
                </Button>
            </div>
        </div >
    );
}
