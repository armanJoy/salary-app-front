/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ActionType,
    ProTable,
    ProColumns,
    RequestData,
    TableDropdown,
    ProDescriptions,
} from '@ant-design/pro-components';
import { Avatar, BreadcrumbProps, Modal, Space, Table } from 'antd';
import { useRef } from 'react';
import { FiUser, FiUsers } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { webRoutes } from '../../routes/web';
import {
    handleErrorResponse,
    NotificationType,
    showNotification,
} from '../../utils';
import http from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';
import LazyImage from '../lazy-image';
import Icon, {
    ExclamationCircleOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import Product from '../employee/employee';
import Employee from '../employee/employee';
enum ActionKey {
    DELETE = 'delete',
}

const breadcrumb: BreadcrumbProps = {
    items: [
        {
            key: webRoutes.dashboard,
            title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
        },
        {
            key: webRoutes.users,
            title: <Link to={webRoutes.users}>Users</Link>,
        },
    ],
};

const Users = () => {
    const actionRef = useRef<ActionType>();
    const [modal, modalContextHolder] = Modal.useModal();

    const columns: ProColumns[] = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            align: 'center',
            sorter: false,
            render: (_, row: User) =>
            (
                <Avatar shape="circle" size="small">
                    {row.firstName.charAt(0).toUpperCase()}
                </Avatar>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: false,
            align: 'center',
            ellipsis: true,
            render: (_, row: User) => `${row.firstName} ${row.lastName}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: false,
            align: 'center',
            ellipsis: true,
        },
        {
            title: 'Pay Grade',
            dataIndex: 'rank',
            sorter: false,
            align: 'center',
            ellipsis: true,
        },
        {
            title: 'Action',
            align: 'center',
            key: 'option',
            fixed: 'right',
            render: (_, row: User) => [
                <TableDropdown
                    key="actionGroup"
                    onSelect={(key) => handleActionOnSelect(key, row)}
                    menus={[
                        {
                            key: ActionKey.DELETE,
                            name: (
                                <Space>
                                    <DeleteOutlined />
                                    Delete
                                </Space>
                            ),
                        },
                    ]}
                >
                    <Icon
                        component={CiCircleMore}
                        className="text-primary text-xl"
                    />
                </TableDropdown>,
            ],
        },
    ];

    const handleActionOnSelect = (key: string, user: User) => {
        if (key === ActionKey.DELETE) {
            showDeleteConfirmation(user);
        }
    };

    const showDeleteConfirmation = (user: User) => {
        modal.confirm({
            title: 'Are you sure to delete this user?',
            icon: <ExclamationCircleOutlined />,
            content: (
                <ProDescriptions column={1} title=" ">
                    <ProDescriptions.Item valueType="text" label="Name">
                        {user.firstName} {user.lastName}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item valueType="text" label="Email">
                        {user.email}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item valueType="text" label="Rank">
                        {user.rank}
                    </ProDescriptions.Item>
                </ProDescriptions>
            ),
            okButtonProps: {
                className: 'bg-primary',
            },
            onOk: () => {
                return http
                    .delete(`${apiRoutes.users}/${user.id}`)
                    .then(() => {
                        showNotification(
                            'Success',
                            NotificationType.SUCCESS,
                            'User is deleted.'
                        );

                        actionRef.current?.reloadAndRest?.();
                    })
                    .catch((error) => {
                        handleErrorResponse(error);
                    });
            },
        });
    };

    return (
        <BasePageContainer breadcrumb={breadcrumb}>
            <Employee></Employee>
            <ProTable
                columns={columns}
                cardBordered={false}
                cardProps={{
                    subTitle: 'Employees',
                    // tooltip: {
                    //     className: 'opacity-60',
                    //     title: 'Mocked data',
                    // },
                    title: <FiUsers className="opacity-60" />,
                }}
                bordered={true}
                showSorterTooltip={false}
                scroll={{ x: true }}
                tableLayout={'fixed'}
                rowSelection={{
                    selections: [],
                    defaultSelectedRowKeys: [1],
                }}
                tableAlertOptionRender={() => {
                    return (
                        <a>Pay</a>
                        // <Space size={16}>
                        //     <a>Pay</a>
                        //     <a>Pay</a>
                        // </Space>
                    );
                }}
                // rowSelection={true}
                pagination={{
                    showQuickJumper: false,
                    pageSize: 10,
                    position: ["bottomRight"]
                }}
                actionRef={actionRef}
                request={(params) => {
                    return http
                        .get(apiRoutes.users, {
                            params: {
                                page: params.current,
                                per_page: params.pageSize,
                            },
                        })
                        .then((response) => {
                            const users: [User] = response.data;

                            return {
                                data: users,
                                success: true,
                                total: response.data.total,
                            } as RequestData<User>;
                        })
                        .catch((error) => {
                            handleErrorResponse(error);

                            return {
                                data: [],
                                success: false,
                            } as RequestData<User>;
                        });
                }}
                dateFormatter="string"
                search={
                    {
                        searchText: "Search",
                        filterType: 'query',
                        // submitText: "Search"
                        // searchp: () =>  (<button>Submit</button>) 
                    }
                }
                rowKey="id"
                options={{
                    search: false,
                }}
            />
            {modalContextHolder}
        </BasePageContainer>
    );
};

export default Users;
