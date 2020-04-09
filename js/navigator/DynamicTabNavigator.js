import React from "react"
import PopularPage from "../page/PopularPage";
import MyPage from "../page/MyPage";
import FavoritePage from "../page/FavoritePage";
import TrendingPage from "../page/TrendingPage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import Entypo from "react-native-vector-icons/Entypo"
import {createAppContainer} from "react-navigation"
import {createBottomTabNavigator,BottomTabBar} from "react-navigation-tabs"
import {connect} from "react-redux"
import EventBus from "react-native-event-bus";
import EventTypes from "../util/EventTypes"


//在这里配置页面的路由
const TABS = {
    PopularPage: {
        screen: PopularPage,
        navigationOptions: {
            tabBarLabel: "最热",
            tabBarIcon: ({tintColor, focused}) => (
                <MaterialIcons
                    name={'whatshot'}
                    size={26}
                    style={{color: tintColor}}
                />
            )
        }
    },
    TrendingPage: {
        screen: TrendingPage,
        navigationOptions: {
            tabBarLabel: "趋势",
            tabBarIcon: ({tintColor, focused}) => (
                <Ionicons
                    name={'md-trending-up'}
                    size={26}
                    style={{color: tintColor}}
                />
            )
        }
    },
    FavoritePage: {
        screen: FavoritePage,
        navigationOptions: {
            tabBarLabel: "收藏",
            tabBarIcon: ({tintColor, focused}) => (
                <MaterialIcons
                    name={'favorite'}
                    size={26}
                    style={{color: tintColor}}
                />
            )
        }
    },
    MyPage: {
        screen: MyPage,
        navigationOptions: {
            tabBarLabel: "我的",
            tabBarIcon: ({tintColor, focused}) => (
                <Entypo
                    name={'user'}
                    size={26}
                    style={{color: tintColor}}
                />
            )
        }
    }
};


class DynamicTabNavigator extends React.Component {
    constructor(props) {
        super(props);
        console.disableYellowBox = true;//设置关闭黄色警告弹框
    }

    _TabNavigator() {
        if (this.Tabs){
            return this.Tabs;
        }
        const {PopularPage, TrendingPage, FavoritePage, MyPage} = TABS;
        const tabs = {PopularPage, TrendingPage, FavoritePage, MyPage};
        // PopularPage.navigationOptions.tabBarLabel = "最热1";//动态修改Tab属性
        return this.Tabs = createAppContainer(
            createBottomTabNavigator(
                tabs,
                {
                    tabBarComponent: props=>{
                        return <TabBarComponent {...props} theme={this.props.theme}/>;
                    }
                }
            ));
    }

    render() {
        const Tab = this._TabNavigator();
        return <Tab
            onNavigationStateChange={(prevState,newState,action)=>{//底部tab切换时会回调
                EventBus.getInstance().fireEvent(EventTypes.bottom_tab_select,{
                    from:prevState.index,
                    to:newState.index,
                })
            }}
        />;
    }
}

class TabBarComponent extends React.Component {

    render() {
        return <BottomTabBar
            {...this.props}
            activeTintColor={this.props.theme.themeColor}
        />;
    }
}

const mapStateToProps = state=>({
    theme:state.theme.theme
});

/**
 * redux跟组件连接
 */
export default connect(mapStateToProps)(DynamicTabNavigator);