/* eslint-disable no-var */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Form, Input } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import DataTable, { TableColumn, Alignment, SortOrder } from "react-data-table-component";
import { apiRoutes } from '../../routes/api';
import http from '../../utils/http';
import { User } from '../../interfaces/models/user';
import { handleErrorResponse } from '../../utils';
import { Avatar, Modal } from 'antd';
import { FiDelete, FiPlus, FiPlusSquare, FiUsers } from 'react-icons/fi';
import ReactDOM from 'react-dom';
import SalaryDetailsModal from '../salary/SalaryDetailsModal';
import { utilService } from '../common/util';
import SalaryDisburseModal from '../salary/SalaryDisburseModal';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import SalarySetupModal from '../salary/SalarySetupModal';
import CreateEmployee from './CreateEmployee';
import { MdDelete } from "react-icons/md";
import { ApiStatus } from '../../interfaces/models/apistatus';

export default function employee() {
    const columns: TableColumn<User>[] = [
        {
            name: "Name",
            cell: (row) => {
                return <span><Avatar shape="circle" size="small">
                    {row.firstName.charAt(0).toUpperCase()}
                </Avatar> {" " + row.firstName + " " + row.lastName}</span>;
            }
        },
        {
            name: "Employee Id",
            selector: (row) => row.id,
            center: true
        },
        {
            name: "Rank",
            selector: (row) => 'Grade-' + row.rank,
            center: true,
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
            center: true,
        },
        {
            name: "Action",
            width: '250px',
            cell: (row) => {
                return <div >
                    <button style={{ backgroundColor: "rgb(8 145 178)" }} className="text-white px-2 py-1 rounded w-px-auto text-sm mr-5" onClick={(event) => action(row, event)}>
                        Salary
                    </button>
                    <button style={{ backgroundColor: "rgb(8 145 178)" }} className="text-white px-2 py-1 rounded w-px-auto text-sm mr-5" onClick={(event) => addEmployee(row.id)}>
                        Edit
                    </button>

                    <button style={{ backgroundColor: "rgb(8 145 178)" }} className="text-white px-2 py-1 rounded w-px-auto text-sm" onClick={(event) => deleteEmployee(row)}>
                        Delete
                    </button>
                    {modalContextHolde}
                </div>;
            },
            center: true,
        }
    ]
    const [data, setData] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<User[]>([]);
    const [modal, modalContextHolde] = Modal.useModal();
    const [selectedUser, setSelectedUser] = useState<User>();


    const action = (user: User, event: any) => {
        setSelectedUser(user);
        showEmpSalaryDetail(user);
    }

    const onClose = () => {
        console.log();
    }

    const showEmpSalaryDetail = (user: User) => {

        modal.info({
            title: 'Salary Information',
            // + user.firstName + " " + user.lastName,
            content: (
                <SalaryDetailsModal user={user} onClose={onClose}></SalaryDetailsModal>
            ),
            closable: true,
            width: '50%',
            icon: false,
            maskClosable: true,
            // okText: 'Close',
            // okButtonProps: {
            //     className: 'bg-primary',
            // },
            // cancelButtonProps: {
            //     className: 'bg-primary',
            // }
        });
    };
    const getEmployee = async () => {
        console.log("inside getProduct")
        const promise = http.get(apiRoutes.users)
            .then((response) => {
                const users: [User] = response.data;
                setData(response.data);
                setFilter(response.data);
            })
            .catch((error) => {
                handleErrorResponse(error);
                setData([]);
                setFilter([]);
            });

        // toast.promise(promise, {
        //     pending: "Promise is pending",
        //     success: "Promise  Loaded",
        //     error: "error",
        // });
    }

    useEffect(() => {
        getEmployee();
    }, []);

    useEffect(() => {
        console.log("inside filter")
        const result = data.filter(item => item.firstName.toLowerCase().startsWith(search.toLowerCase()) || item.lastName.toLowerCase().startsWith(search.toLowerCase()));
        setFilter(result);
    }, [search]);

    // useEffect(() => {
    //     console.log("inside filter")
    //     const result = data.filter(item => item.firstName.toLowerCase().startsWith(search.toLowerCase()) || item.lastName.toLowerCase().startsWith(search.toLowerCase()));
    //     setFilter(result);
    // }, [removedItem]);

    const disburseSalary = (state: any) => {
        console.log("Inside disburseSalary");
        console.log(selectedData);
        if (selectedData && selectedData.length > 0) {
            // getEmployeeSalary();
            confirmSalaryDisburse(selectedData);
        } else {
            utilService.infoToast("Select employees to disburse salary")
        }

    }

    const confirmSalaryDisburse = (user: User[]) => {
        modal.info({
            title: 'Salary Disbursement',
            content: <SalaryDisburseModal user={user}></SalaryDisburseModal>,
            closable: true,
            width: '60%',
            icon: false,
            // maskClosable: true,
            // okText: '',
            // cancelText: '',
            // okButtonProps: {
            //     className: 'bg-primary',
            // },
            // onOk: () => {
            //     console.log();
            // }
        });
    };
    const [selectedData, setSelectedData] = React.useState<User[]>([]);
    const handleChange = (state: any) => {
        setSelectedData(state.selectedRows);
    };
    const openSalarySetup = (flag: number) => {
        console.log("Inside openSalarySetup");
        modal.info({
            title: 'Salary Settings',
            content: <SalarySetupModal flag={flag}></SalarySetupModal>,
            closable: true,
            // width: '60%',
            icon: false,
            maskClosable: true,
            // okText: '',
            // cancelText: '',
            // okButtonProps: {
            //     className: 'bg-primary',
            // },
            // onOk: () => {
            //     console.log();
            // }
        });
    }
    const onAddEmployeeClose = (userInfo: any) => {
        console.log("Inside onAddEmployeeClose");
        if (userInfo && userInfo.id) {
            filter.unshift(userInfo);
        }
        if (addEmpModal) {
            addEmpModal.destroy();
        }

        getEmployee();
    }

    var addEmpModal: any = null;
    const addEmployee = (userId?: number) => {
        console.log("Inside addEmployee");

        addEmpModal = modal.info({
            title: (userId) ? 'Update Employee Information' : 'Add Employee Information',
            content: <CreateEmployee user={userId} onClose={onAddEmployeeClose}></CreateEmployee>,
            closable: true,
            width: '60%',
            icon: false,
            maskClosable: true,
            // okText: '',
            // cancelText: '',
            // okButtonProps: {
            //     className: 'bg-primary',
            // },
            // onOk: () => {
            //     console.log();
            // }
        });
    }

    const deleteEmployee = (user: User) => {
        console.log("Inside deleteEmployee");
        modal.confirm({
            title: 'Confirm removing employee',
            content: <div>
                <h1>Name: {user.firstName + " " + user.lastName}</h1>
                <h1>Rank: {"Grade-" + user.rank}</h1>
                <h1>Date of Joining: {user.joiningDate}</h1>
            </div>,
            closable: true,
            icon: false,
            maskClosable: true,
            // okText: '',
            // cancelText: '',
            // okButtonProps: {
            //     className: 'bg-primary',
            // },
            onOk: () => {
                http.delete(apiRoutes.deleteEmployee, {
                    params: {
                        userId: user.id
                    }
                })
                    .then((response) => {
                        const res: ApiStatus = response.data;

                        if (res.jobDone) {
                            utilService.successToast("Employee removed");
                            const result = filter.filter(item => item.id != user.id);
                            setFilter(result);
                        } else {
                            utilService.successToast("Couldn't remove employee. Try later");
                        }

                    })
                    .catch((error) => {
                        handleErrorResponse(error);
                        utilService.successToast("Couldn't remove employee. Try later");
                    });
            }
        });

    }
    return (
        <React.Fragment>
            <div className="flex items-center"><FiUsers className="opacity-100" size={16} /> <p className='pl-2 text-lg pr-5'>Employee List</p><FiPlusSquare cursor={'pointer'} color='green' className="opacity-100" size={20} onClick={(e) => addEmployee()} /></div>

            <DataTable columns={columns} data={filter}
                pagination
                selectableRows
                onSelectedRowsChange={handleChange}
                fixedHeader
                selectableRowsHighlight
                highlightOnHover
                actions={

                    <span className='z-10'>
                        {/* <button className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded w-px-auto text-sm mr-10" onClick={(key) => openSalarySetup(1)}>
                            Basic Salary
                        </button> */}

                        <button className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded w-px-auto text-sm mr-10" onClick={(key) => openSalarySetup(2)}>
                            Company Balance
                        </button>

                        <button className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded w-px-auto text-sm" onClick={disburseSalary}>
                            Disburse Salary
                        </button>
                    </span>
                }
                subHeader
                subHeaderComponent={
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="search" type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                }
                subHeaderAlign={Alignment.LEFT}

            />

        </React.Fragment>
    );


}

