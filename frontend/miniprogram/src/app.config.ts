export default defineAppConfig({
    pages: [
        'pages/index/index',
        'pages/workouts/list/index',
        'pages/workouts/create/index',
        'pages/workouts/edit/index',
        'pages/routines/list/index',
        'pages/routines/create/index',
        'pages/routines/edit/index',
        'pages/exercises/list/index',
        'pages/exercises/create/index',
        'pages/exercises/edit/index',
        'pages/gyms/list/index',
        'pages/gyms/create/index',
        'pages/gyms/edit/index',
        'pages/muscles/list/index',
        'pages/muscles/create/index',
        'pages/muscles/edit/index'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '健身追踪',
        navigationBarTextStyle: 'black',
        backgroundColor: '#f5f5f5'
    },
    tabBar: {
        color: '#999999',
        selectedColor: '#1976d2',
        backgroundColor: '#ffffff',
        borderStyle: 'black',
        list: [
            {
                pagePath: 'pages/index/index',
                text: '首页',
                iconPath: 'assets/icons/home.png',
                selectedIconPath: 'assets/icons/home-active.png'
            },
            {
                pagePath: 'pages/workouts/list/index',
                text: '训练',
                iconPath: 'assets/icons/workout.png',
                selectedIconPath: 'assets/icons/workout-active.png'
            },
            {
                pagePath: 'pages/routines/list/index',
                text: '计划',
                iconPath: 'assets/icons/routine.png',
                selectedIconPath: 'assets/icons/routine-active.png'
            },
            {
                pagePath: 'pages/exercises/list/index',
                text: '动作',
                iconPath: 'assets/icons/exercise.png',
                selectedIconPath: 'assets/icons/exercise-active.png'
            }
        ]
    }
});
