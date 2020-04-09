export default class NavigationUtil{
    /**
     * 跳转到指定页面
     * @param params 要传递的参数
     * @param page 要跳转到的页面名
     */
    static goPage(page,params={}){
        const navigation = NavigationUtil.navigation;
        if (!navigation){
            console.log("NavigationUtil.navigation can not be null")
        }
        navigation.navigate(
            page,
            {...params}
        )
    }
    static goBack(){
        const navigation = NavigationUtil.navigation;
        navigation.goBack(null);
    }
    /**
     * 重置到首页
     * @param params
     */
    static resetToHomePage(params){
        const {navigation} = params;
        navigation.navigate("Main");
    }
}