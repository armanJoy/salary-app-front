/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Form, Input, Select } from 'antd';
import { FC, Fragment, useEffect, useState } from 'react';
import { apiRoutes } from '../../routes/api';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/adminSlice';
import { RootState } from '../../store';
import { useLocation, useNavigate } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { handleErrorResponse, setPageTitle } from '../../utils';
import { Admin } from '../../interfaces/models/admin';
import http, { defaultHttp } from '../../utils/http';
import { utilService } from '../common/util';
import { ApiStatus } from '../../interfaces/models/apistatus';

interface FormValues {
    email: string;
    password: string;
    retypedPassword: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    address: string;
    rank: number;
    nid: string;
    joiningDate: Date;
    empBankId: number;
    userId: number;
    acName: string;
    acNumber: string;
    acType: string;
    bank: string;
    branch: string;
    routing: string;

}

interface ModalProps {
    onClose: (userInfo: any) => void;
    user?: number;
}

export default function CreateEmployee(props: ModalProps): ReturnType<FC> {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || webRoutes.users;
    const admin = useSelector((state: RootState) => state.admin);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState<any>();

    useEffect(() => {
        if (props.user && props.user > 0) {
            getEmployee();
        }
        setLoading(false);

    }, []);

    useEffect(() => {
        if (admin) {
            navigate(from, { replace: true });
        }
    }, [admin]);

    const getEmployee = async () => {
        console.log("inside getEmployee")
        const promise = http.get(apiRoutes.employeeInfo, {
            params: {
                userId: props.user
            }
        })
            .then((response) => {
                const userInfo: any = response.data;
                setEditingUser(userInfo);
                console.log(userInfo);
                form.setFieldValue("email", userInfo.email);
                form.setFieldValue("password", "edit-mode");
                form.setFieldValue("firstName", userInfo.firstName);
                form.setFieldValue("lastName", userInfo.lastName);
                setSelectedGender(userInfo.gender);
                form.setFieldValue("phone", userInfo.phone);
                form.setFieldValue("address", userInfo.address);
                setSelectedRank(ranks[userInfo.rank - 1])
                form.setFieldValue("nid", userInfo.nid);
                form.setFieldValue("joiningDate", userInfo.joiningDate);
                form.setFieldValue("acName", userInfo.empBankInfo.acName);
                form.setFieldValue("acNumber", userInfo.empBankInfo.acNumber);
                setSelectedAcType(userInfo.empBankInfo.acType)
                setSelectedBank(userInfo.empBankInfo.bank)
                form.setFieldValue("branch", userInfo.empBankInfo.branch);
                form.setFieldValue("routing", userInfo.empBankInfo.routing);
                console.log(form.getFieldsValue());
            })
            .catch((error) => {
                handleErrorResponse(error);
            });

    }

    const onSubmit = (values: FormValues) => {
        console.log(values);
        setLoading(true);
        const userInfo = {
            id: (props.user && props.user > 0) ? props.user : null,
            email: values.email,
            password: (values.password) ? values.password : "edit-mode",
            firstName: values.firstName,
            lastName: values.lastName,
            gender: selectedGender,
            phone: values.phone,
            address: values.address,
            rank: ranks.findIndex(item => item == selectedRank) + 1,
            nid: values.nid,
            joiningDate: values.joiningDate,
            userType: 'employee',
            empBankInfo: {
                empBankId: (editingUser) ? editingUser.empBankInfo.empBankId : null,
                acName: values.acName,
                acNumber: values.acNumber,
                acType: selectedAcType,
                bank: selectedBank,
                branch: values.branch,
                routing: values.routing
            }
        }
        console.log(userInfo);
        http.post((props.user && props.user > 0) ? apiRoutes.updateUser : apiRoutes.createUser, userInfo)
            .then((response) => {
                setLoading(false);
                const newUser: ApiStatus = response.data;
                console.log(newUser);
                if (newUser.jobDone) {
                    utilService.successToast(newUser.msg);
                    props.onClose(userInfo);
                } else {
                    utilService.warnToast(newUser.msg);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log(error.response);
                handleErrorResponse(error);
                const errorMsg = (error.response.data.msg) ? error.response.data.msg : error.response.data.message;
                utilService.warnToast(errorMsg);
            });
    };
    const genders = ['Male', 'Female', 'Other'];
    const [selectedGender, setSelectedGender] = useState(genders[0]);
    const onGenderChange = (e: string) => {
        setSelectedGender(e);
    }

    const ranks = ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-4', 'Grade-5', 'Grade-6'];
    const [selectedRank, setSelectedRank] = useState(ranks[0]);
    const onRankChange = (e: string) => {
        const index = ranks.findIndex(item => item == e);
        setSelectedRank(e);
    }

    const acTypes = ['Savings', 'Current'];
    const [selectedAcType, setSelectedAcType] = useState(acTypes[0]);
    const onAcTypeChange = (e: string) => {
        setSelectedAcType(e);
    }

    const banks = ['Pubali Bank PLC', 'City Bank Ltd'];
    const [selectedBank, setSelectedBank] = useState(banks[0]);
    const onBankChange = (e: string) => {
        setSelectedBank(e);
    }
    return (
        <Fragment>
            {/* <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-left text-opacity-30 tracking-wide">
                New Employee Information
            </h1> */}
            <Form
                className="space-y-4 md:space-y-6 mt-5"
                form={form}
                name="login"
                onFinish={onSubmit}
                layout={'vertical'}
                requiredMark={true}
            >
                {/* name */}
                <div className='flex w-auto'>
                    <Form.Item className='w-full'
                        name="firstName"
                        label={
                            <p className="block text-sm font-medium text-gray-900">First Name</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^[A-Za-z\s.]+$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Alphabate, space and period only");
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                    <Form.Item className='ml-10 w-full'
                        name="lastName"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Last Name</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^[A-Za-z\s.]+$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Alphabate, space and period only");
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                </div>
                {/* email gender */}
                <div className='flex w-auto' style={{ display: (props.user && props.user > 0) ? 'none' : '' }}>
                    <Form.Item style={{ marginTop: '-30px' }} className='w-full'
                        name="email"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Email</p>
                        }
                        rules={(props.user && props.user > 0) ? [] : [
                            {
                                required: (props.user && props.user > 0) ? false : true,
                                type: 'email',
                                message: 'Invalid email address',
                            },
                        ]}
                    >
                        <Input
                            placeholder="name@example.com"
                            className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginTop: '-30px' }} className="w-full ml-10"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Gender</p>
                        }
                    >
                        <Select className='w-full' id="genderSelect" value={selectedGender} onChange={onGenderChange}>
                            <option value="" disabled>Select Gender</option>
                            {genders.map((gender, index) => (
                                <option key={index} value={gender}>
                                    {gender}
                                </option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
                {/* address */}
                <div >
                    <Form.Item style={{ marginTop: '-30px' }}
                        name="address"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Address</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^[A-Za-z0-9\s.,!?'"()/\\-]+$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Alphanumeric and punctuation only");
                                }
                            }
                        ]}

                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                        />
                    </Form.Item>
                </div>
                {/* phone pay grade*/}
                <div style={{ marginTop: '-5px' }} className='flex w-auto'>
                    <Form.Item className='w-full'
                        name="phone"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Phone</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^(013|014|015|016|017|018|019)\d{8}$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Invalid phone number");
                                }
                            }
                        ]}

                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                    <Form.Item className="w-full ml-10"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Pay Grade</p>
                        }
                    >
                        <Select className='w-full' id="rankSelect" value={selectedRank} onChange={onRankChange}>
                            <option value="" disabled>Select Pay Grade</option>
                            {ranks.map((rank, index) => (
                                <option key={index} value={rank}>
                                    {rank}
                                </option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
                {/* joining NID*/}
                <div style={{ marginTop: '-5px', display: (props.user && props.user > 0) ? 'none' : '' }} className='flex w-auto'>
                    <Form.Item className='w-full'
                        name="nid"
                        label={
                            <p className="block text-sm font-medium text-gray-900">NID</p>
                        }
                        rules={(props.user && props.user > 0) ? [] : [
                            {
                                required: (props.user && props.user > 0) ? false : true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^(\d{13}|\d{17})$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("NID must be 13 or 17 digit");
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                    <Form.Item className='ml-10 w-full'
                        name="joiningDate"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Joining Date</p>
                        }

                    >
                        <Input
                            type='date'
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                </div>
                {/* password */}
                <div className='flex w-auto' style={{ display: (props.user && props.user > 0) ? 'none' : '' }}>
                    <Form.Item style={{ marginTop: '-30px' }} className='w-full'
                        name="password"
                        label={
                            <p className="block text-sm font-medium text-gray-900">
                                Password
                            </p>
                        }
                        rules={(props.user && props.user > 0) ? [] : [
                            {
                                required: (props.user && props.user > 0) ? false : true,
                                validator: (rule, value, callback) => {
                                    if (value && value.length < 6) {
                                        return Promise.reject("");
                                    }
                                    return Promise.resolve("");
                                },
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="••••••••"
                            visibilityToggle={true}
                            className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginTop: '-30px' }} className='ml-10 w-full'
                        name="retypedPassword"
                        label={
                            <p className="block text-sm font-medium text-gray-900">
                                Re-type Password
                            </p>
                        }
                        rules={(props.user && props.user > 0) ? [] : [
                            {
                                required: (props.user && props.user > 0) ? false : true,
                                validator: (rule, value, callback) => {
                                    if (!value && !value.match(form.getFieldValue('password'))) {
                                        return Promise.reject("Password do not match");
                                    }
                                    return Promise.resolve();
                                }
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="••••••••"
                            visibilityToggle={true}
                            className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                        />
                    </Form.Item>
                </div>
                <div style={{ marginTop: '-5px', marginBottom: '30px' }} className=" text-base font-medium text-gray-900 border-solid pb-2 border-b-2">Bank Information </div>
                {/* acName acNumber*/}
                <div style={{ marginTop: '-5px' }} className='flex w-auto'>
                    <Form.Item className='w-full'
                        name="acName"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Account Owner</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^[A-Za-z\s.]+$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Alphabate, space and period only");
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                    <Form.Item className=' w-full ml-10'
                        name="acNumber"
                        label={
                            <p className="block text-sm font-medium text-gray-900">A/C No</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^\d{10,18}$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Check A/C number carefully");
                                }
                            }
                        ]}
                    >
                        <Input
                            type='text'
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                </div>

                {/* acType bank*/}
                <div style={{ marginTop: '-5px' }} className='flex w-auto'>
                    <Form.Item className="w-full"
                        label={
                            <p className="block text-sm font-medium text-gray-900">A/C Type</p>
                        }
                    >
                        <Select className='w-full' id="acTypeSelect" value={selectedAcType} onChange={onAcTypeChange}>
                            <option value="" disabled>Select Type</option>
                            {acTypes.map((acType, index) => (
                                <option key={index} value={acType}>
                                    {acType}
                                </option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item className="w-full ml-10"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Bank</p>
                        }
                    >
                        <Select className='w-full' id="bankSelect" value={selectedBank} onChange={onBankChange}>
                            <option value="" disabled>Select Bank</option>
                            {banks.map((bank, index) => (
                                <option key={index} value={bank}>
                                    {bank}
                                </option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
                {/* branch routing */}
                <div style={{ marginTop: '-5px' }} className='flex w-auto'>
                    <Form.Item className='w-full'
                        name="branch"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Branch</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^[A-Za-z\s.]+$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Alphabate, space and period only");
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                    <Form.Item className='ml-10 w-full'
                        name="routing"
                        label={
                            <p className="block text-sm font-medium text-gray-900">Routing</p>
                        }
                        rules={[
                            {
                                required: true,
                                type: 'regexp',
                                validator: (rule, value, callback) => {
                                    if (value && value.match(/^\d{6,9}$/)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Check routing number carefully");
                                }
                            }
                        ]}
                    >
                        <Input
                            type='text'
                            placeholder=""
                            className="bg-gray-50 text-gray-900 sm:text-sm"
                        />
                    </Form.Item>
                </div>

                <div className="text-center">
                    <Button
                        className="mt-4 bg-primary"
                        block
                        loading={loading}
                        type="primary"
                        size="large"
                        htmlType={'submit'}
                    >
                        {(props.user && props.user > 0) ? 'Update' : 'Save'}
                    </Button>
                </div>
            </Form>
        </Fragment >
    );
}


