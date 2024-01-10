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
import DataTable, { TableColumn } from 'react-data-table-component';
import { Avatar } from 'antd';
import { apiRoutes } from '../../routes/api';
import http from '../../utils/http';
import { handleErrorResponse } from '../../utils';
import { utilService } from '../common/util';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface ModalProps {
    onClose: () => void;
    user: User;
}

export default function SalaryDetailsModal(props: ModalProps): ReturnType<FC> {
    const [empSalary, setEmpSalary] = useState<any[]>([]);
    useEffect(() => {
        getSalaryDetails();
    }, []);
    const getSalaryDetails = async () => {
        console.log("inside getSalaryDetails")
        http.get(apiRoutes.empSalary, {
            params: {
                empId: props.user?.id,
            },
        })
            .then((response) => {
                const salaries: [any] = response.data;
                console.log(salaries);
                setEmpSalary(response.data);
            })
            .catch((error) => {
                handleErrorResponse(error);
                setEmpSalary([]);
            });
    }

    // const updateDueSalary = (salaryInfo: any) => {
    //     empSalary.forEach(item => {
    //         if (item.smonth == salaryInfo.smonth && item.syear == salaryInfo.syear) {
    //             item.disbursed = true;
    //         }
    //     })
    // }


    const payDueSalary = async (salaryInfo: any, event: any) => {
        console.log("Inside payDueSalary");
        const promise = http.post(apiRoutes.payDue, salaryInfo)
            .then((response) => {
                const res: ApiStatus = response.data;
                console.log(salaryInfo);
                console.log(res);
                if (res.jobDone) {
                    utilService.successToast("Payment successful");
                    getSalaryDetails();
                } else {
                    utilService.warnToast(res.msg);
                }

            })
            .catch((error) => {
                handleErrorResponse(error);

            })

        toast.promise(promise, {
            pending: "Disbursing salary",
        });
    }
    const columns: TableColumn<any>[] = [
        {
            name: "Month",
            cell: (row) => {
                const date = new Date();
                date.setMonth(row.smonth - 1);
                const monthName = date.toLocaleString('en-US', { month: 'long' });
                return <span>{monthName + ", " + row.syear}</span>;
            }
        },
        // {
        //     name: "Employee Id",
        //     selector: (row) => row.id,
        //     center: true
        // },
        // {
        //     name: "Rank",
        //     selector: (row) => row.rank,
        //     center: true,
        //     sortable: true,
        // },
        {
            name: "Salary",
            cell: (row) => (row.disbursed) ? row.samount : <button style={{ backgroundColor: "rgb(8 145 178)" }} className="text-white px-2 py-1 rounded w-px-auto text-base" onClick={(event) => payDueSalary(row, event)}>
                Pay Now
            </button>,
            center: true,
            sortable: true,
        }
    ]

    return (
        <div>
            <div >
                <div >
                    <h1>Employee Name: {props.user?.firstName + " " + props.user?.lastName}</h1>
                    <h1>Rank: {props.user?.rank}</h1>
                    <h1>Date of joining: {props.user?.joiningDate}</h1>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={empSalary}
                        pagination
                        paginationPerPage={12}
                        paginationRowsPerPageOptions={[12, 24, 36]}
                        fixedHeader
                        highlightOnHover
                    />
                </div>
                {/* <div className="btn-container">
                    <button type="button" className="btn" onClick={props.onClose}>Close</button>
                </div> */}
            </div>
        </div>
    );
}
