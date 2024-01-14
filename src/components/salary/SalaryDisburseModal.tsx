/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-var */
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
import { Alert, Avatar, Card, Checkbox, Select } from 'antd';
import { apiRoutes } from '../../routes/api';
import http from '../../utils/http';
import { handleErrorResponse } from '../../utils';
import { Button, Form, Input } from 'antd';
import { utilService } from '../common/util';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Meta from 'antd/es/card/Meta';


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
    const columns: TableColumn<any>[] = [
        {
            name: "Name",
            cell: (row) => {
                return <span>{" " + row.firstName + " " + row.lastName}</span>;
            },
            width: '130px',
        },
        {
            name: "Employee Id",
            selector: (row) => row.id,
            center: true,
            width: '100px'
        },
        {
            name: "Rank",
            selector: (row) => 'Grade-' + row.rank,
            center: true,
            sortable: true,
            width: '80px'
        },
        {
            name: "Joined",
            cell: (row) => {
                const date = new Date(row.joiningDate);
                const monthName = date.toLocaleString('en-US', { month: 'long' });
                return <span>{monthName + ", " + date.getFullYear()}</span>;
            },
            width: '130px',
            center: true
        },
        {
            name: "Salary",
            selector: (row) => (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) ? (row.bonusPer && row.bonusPer > 0) ? Math.round((row.salary / (1.35 + (row.bonusPer / 100))) * 1.35) : row.salary : 'N/A',
            center: true,
            width: '80px'
        },
        // 
        //
        // column logic for bonus will be applied for already paid employees if they didn't received the bonus
        // {
        //     name: "Bonus",
        //     cell: (row: any) => (row.bonusPer && row.bonusPer > 0) ? Math.round((row.salary / (1.35 + (row.bonusPer/100))) * (row.bonusPer/100)) : (bonus && (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime())) ? Math.round((row.salary / 1.35) * (form.getFieldValue("bonusPercentage") / 100)) : 'N/A',
        //     center: true,
        //     width: '70px'
        // },
        // {
        //     name: "Total",
        //     selector: (row) => (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) ? ((row.bonusPer && row.bonusPer > 0) || !bonus) ? row.salary : Math.round((row.salary / 1.35) * (1.35 + (form.getFieldValue("bonusPercentage") / 100))) : 'N/A',
        //     center: true,
        //     width: '70px'
        // },
        // 
        // 
        // column logic for bonus will not be applied for already paid employees
        {
            name: "Bonus",
            cell: (row: any) => (row.bonusPer && row.bonusPer > 0) ? Math.round((row.salary / (1.35 + (row.bonusPer / 100))) * (row.bonusPer / 100)) : (bonus && !row.disbursed && (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime())) ? Math.round((row.salary / 1.35) * (form.getFieldValue("bonusPercentage") / 100)) : 'N/A',
            center: true,
            width: '70px'
        },
        {
            name: "Total",
            selector: (row) => (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) ? ((row.bonusPer && row.bonusPer > 0) || !bonus || row.disbursed) ? row.salary : Math.round((row.salary / 1.35) * (1.35 + (form.getFieldValue("bonusPercentage") / 100))) : 'N/A',
            center: true,
            width: '80px'
        },
        {
            name: "Status",
            cell: (row) => (new Date(row.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) ? (row.disbursed) ? 'Paid' : 'Unpaid' : 'N/A',
            center: true,
            width: '80px'
        }
    ]
    const [salaries, setSalaries] = useState<any[]>([]);
    const [totalSalary, setTotalSalary] = useState<number>();
    const [companyBalance, setCompanyBalance] = useState<number>();
    const [form] = Form.useForm();
    const [salaryTableColumn, setSalaryTableColumn] = useState<any[]>(columns);
    const [bonusPercentage, setBonusPercentage] = useState<number>(0);

    useEffect(() => {
        console.log('Inside useEffect >> Month: ' + form.getFieldsValue().month + 'Year: ' + form.getFieldsValue().year);
        getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
    }, []);

    useEffect(() => {
        getCompanyBalance();
    }, []);

    const onBonusPercentageChange = (e: any) => {
        console.log("Inside onBonusPercentageChange" + form.getFieldValue("bonusPercentage") + bonusPercentage);
        // var cols = [...salaryTableColumn];
        // setSalaryTableColumn(cols);

        var cols = [...columns];
        setSalaryTableColumn(cols);

        var salarySum = 0;
        salaries.forEach((obj) => {
            if (!obj.disbursed && new Date(obj.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) {
                salarySum += obj.salary + ((bonus) ? Math.round((obj.salary / 1.35) * (form.getFieldValue("bonusPercentage") / 100)) : 0);
            }
        });
        setTotalSalary(salarySum);
    }

    const updateColumns = (e: any) => {
        console.log(e)
        console.log(e.target.checked)
        var cols = [...columns];
        setBonus(e.target.checked)
        setSalaryTableColumn(cols);
        // if (e.target.checked) {
        //     const newCol = {
        //         name: "Bonus",
        //         cell: (row: any) => Math.round((row.salary / 1.35) * (form.getFieldValue("bonusPercentage") / 100)),
        //         center: true,
        //     };
        //     cols.push(newCol);

        // } else {
        //     cols = cols.filter(item => item.name != "Bonus");
        // }
        // setSalaryTableColumn(cols);
    }

    const getCompanyBalance = async () => {
        const promise = http.get(apiRoutes.fetchCompanySalaryAc)
            .then((response) => {
                setCompanyBalance(response.data.balance);
                // setSalaryTableColumn(columns.slice(0, 4));

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
                const salarieRes: any[] = response.data;
                // .filter((item: any) => {
                //     const exist = props.user.find(each => each.id == item.id);
                //     if (exist && exist.id == item.id) {
                //         return item;
                //     }
                // });
                console.log(salarieRes);
                setSalaries(salarieRes);
                var salarySum: number = 0;
                salarieRes.forEach((obj) => {
                    if (!obj.disbursed && new Date(obj.joiningDate).getTime() <= new Date(year, month, 1).getTime()) {
                        salarySum += obj.salary + ((bonus) ? Math.round((obj.salary / 1.35) * (form.getFieldValue("bonusPercentage") / 100)) : 0);
                    }
                });
                console.log(month + ',' + year + 'Total salary: ' + salarySum);
                // salarieRes.reduce((sum: number, obj) => {
                //     return sum + ((!obj.disbursed && new Date(obj.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()) ? obj.salary : 0);
                // }, 0);

                setTotalSalary(salarySum);
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }

    const updateEmpSalary = (updated: any[]) => {
        const data = [...salaries];
        // console.log(data);
        for (let index = 0; index < data.length; index++) {
            const updatedItem = updated.find(item => item.id == data[index].id);
            if (updatedItem) {
                data[index] = updatedItem;
            }
        }
        setSalaries(data);
    }

    const disburseSalary = () => {

        const payableSalaryInfo = salaries.filter(item => !item.disbursed && new Date(item.joiningDate).getTime() <= new Date(selectedYear, selectedMonth, 1).getTime()).map(item => {
            item.bonusPer = form.getFieldValue("bonusPercentage");
            item.salary = (bonus) ? Math.round((item.salary / 1.35) * (1.35 + (item.bonusPer / 100))) : item.salary;
            return item;
        })
        const promise = http.post(apiRoutes.disburse, payableSalaryInfo)
            .then((response) => {
                console.log(response.data);
                const res: ApiStatus = response.data;
                if (response.data.jobDone) {
                    utilService.successToast(res.msg);
                    updateEmpSalary(res.data);
                    getCompanyBalance();
                } else {
                    utilService.warnToast(res.msg);
                }
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

    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    const [selectedMonth, setSelectedMonth] = useState(1);
    const handleMonthChange = (e: number) => {
        console.log(e);
        setSelectedMonth(e + 1);
        form.setFieldValue("month", e + 1);
        console.log(form.getFieldsValue());
        getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
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
        getEmployeeSalary(form.getFieldsValue().month, form.getFieldsValue().year);
    };
    const [bonus, setBonus] = useState(false);
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
                        month: selectedMonth,
                        year: selectedYear,
                        bonusPercentage: 0
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
                            <Select id="monthSelect" value={selectedMonth - 1} onChange={handleMonthChange}>
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
                            <Select id="yearSelect" value={selectedYear} onChange={handleYearChange}>
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
                <div style={{ marginTop: '-10px', marginBottom: '-10px' }} className='flex'>
                    <Form.Item name="bonuxPercent">

                        <label className="block text-sm font-medium text-gray-900"><input type="checkbox" className='mr-2' onChange={updateColumns} />Pay Bonus
                            {/* <Checkbox onChange={updateColumns}>Pay Bonus</Checkbox> */}
                        </label>
                    </Form.Item>

                    <Form.Item hidden={!bonus} className='ml-10'
                        name="bonusPercentage"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Bonus Percentage</p>
                        }
                    >
                        <Input placeholder="" value={bonusPercentage} onChange={onBonusPercentageChange} type='number' className="bg-gray-50 text-gray-900 sm:text-sm py-1.5" />
                    </Form.Item>
                </div>

            </Form>

            <DataTable subHeader subHeaderAlign={Alignment.LEFT} subHeaderComponent={<Card className='text-sm w-full  block text-sm text-gray-900 border-2 border-opacity-50 border-gray-300 mr-4'><h1 className='pb-2 '>Projected Disbursement :   {totalSalary}</h1><h1 className='pb-2'>Company balance :   {companyBalance}</h1><h1 className=''>Projected balance after disbursement :   {(companyBalance >= 0 && totalSalary >= 0) ? companyBalance - totalSalary : 0}</h1></Card>} columns={columns} data={salaries} />

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
