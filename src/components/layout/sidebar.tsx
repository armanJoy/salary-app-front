import { webRoutes } from '../../routes/web';
import { UserOutlined } from '@ant-design/icons';

export const sidebar = [
    {
        path: webRoutes.users,
        key: webRoutes.users,
        name: 'Employee',
        icon: <UserOutlined />,
    },
    //   {
    //     path: webRoutes.about,
    //     key: webRoutes.about,
    //     name: 'About',
    //     icon: <InfoCircleOutlined />,
    //   },
];
