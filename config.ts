//config.ts

enum LayoutType {
    MIX = 'mix',
    TOP = 'top',
    SIDE = 'side',
}

const CONFIG = {
    appName: 'Salary App',
    helpLink: '',
    enablePWA: true,
    theme: {
        accentColor: '#818cf8',
        sidebarLayout: LayoutType.MIX,
        showBreadcrumb: true,
    },
    metaTags: {
        title: 'Salary App',
        description: 'Salary App',
        imageURL: 'logo.svg',
    },
};

export default CONFIG;
