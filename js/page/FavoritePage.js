import React, {Component} from "react";
import {View, Text, Button, FlatList, StyleSheet, RefreshControl, ActivityIndicator} from "react-native";
import {connect} from "react-redux";
import actions from "../action/index"
import {createMaterialTopTabNavigator} from "react-navigation-tabs"
import {createAppContainer} from "react-navigation"
import PopularItem from "../common/PopularItem"
import NavigationBar from "../common/NavigationBar"
import Toast from "react-native-easy-toast"
import NavigationUtil from "../navigator/NavigationUtil";
import DataStoreDemoPage from "./DataStoreDemoPage";
import FavoriteDao from "../expand/dao/FavoriteDao";
import {FLAG_STORAGE} from "../expand/dao/DataStore";
import FavoriteUtil from "../util/FavoriteUtil";
import TrendingItem from "../common/TrendingItem";
import EventBus from "react-native-event-bus";
import EventTypes from "../util/EventTypes"



class FavoritePage extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: "light-content",
        };
        let navigationBar = <NavigationBar
            title={"收藏"}
            statusBar={statusBar}
            style={{backgroundColor: theme.themeColor}}
        />;
        const TabNavigator = createAppContainer(
            createMaterialTopTabNavigator({
                    'Popular': {
                        screen: props => <FavoriteTabPage {...props} flag={FLAG_STORAGE.flag_popular} theme={theme}/>,
                        navigationOptions: {
                            title: "最热"
                        }
                    },
                    'Trending': {
                        screen: props => <FavoriteTabPage {...props} flag={FLAG_STORAGE.flag_trending} theme={theme}/>,
                        navigationOptions: {
                            title: "趋势"
                        }
                    }
                },
                {
                    tabBarOptions: {
                        tabStyle: styles.tabStyle,
                        upperCaseLabel: false,
                        scrollEnabled: false,
                        style: {
                            backgroundColor: theme.themeColor
                        },
                        indicatorStyles: styles.indicatorStyles,
                        labelStyle: styles.labelStyle
                    }
                }
            ));
        return (
            <View style={styles.container}>
                {navigationBar}
                <TabNavigator/>
            </View>
        );
    }
}

const mapFavoriteStateToProps = state=>({
    theme:state.theme.theme
});

/**
 * redux跟组件连接
 */
export default connect(mapFavoriteStateToProps)(FavoritePage);

class FavoriteTab extends Component {
    constructor(props) {
        super(props);
        const {flag} = this.props;
        this.storeName = flag;
        this.favoriteDao = new FavoriteDao(flag);
    }

    componentDidMount() {
        this.loadData(true);
        //监听底部切换事件
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select,this.listener=data=>{
            //切换到第三个（索引是2）页面时刷新一下页面，loading不显示
            if (data.to === 2){
                this.loadData(false);
            }
        })
    }

    componentWillUnmount(){
        EventBus.getInstance().removeListener(this.listener);
    }

    _store() {
        const {favorite} = this.props;
        let store = favorite[this.storeName];
        if (!store) {
            store = {
                items: [],
                isLoading: false,
                projectModels: [],//要显示的数据
            }
        }
        return store;
    }

    loadData(isShowLoading) {
        const {onLoadFavoriteData} = this.props;
        onLoadFavoriteData(this.storeName, isShowLoading);
    }

    onFavorite(item, isFavorite){
        FavoriteUtil.onFavorite(this.favoriteDao, item, isFavorite, this.storeName);
        if (this.storeName===FLAG_STORAGE.flag_popular){
            //发送popular收藏状态发生变化的事件
            EventBus.getInstance().fireEvent(EventTypes.favorite_change_popular);
        } else{
            EventBus.getInstance().fireEvent(EventTypes.favorite_change_trending);
        }
    }


    renderItem(data) {
        const item = data.item;
        const {theme} = this.props;
        const Item = this.storeName === FLAG_STORAGE.flag_popular ? PopularItem : TrendingItem;
        return <Item
            theme={theme}
            projectModel={item}
            onSelect={(callback) => {
                NavigationUtil.goPage("DetailPage", {
                    projectModel: item,
                    flag: this.storeName,
                    callback
                })
            }}
            onFavorite={(item, isFavorite) => {
               this.onFavorite(item, isFavorite);
            }}
        />
    }


    render() {
        let store = this._store();
        const {theme} = this.props;

        return (
            <View style={styles.container}>
                <FlatList
                    data={store.projectModels}
                    renderItem={(data) =>
                        this.renderItem(data)}
                    keyExtractor={item => "" + (item.item.id || item.item.fullName)}
                    refreshControl={
                        <RefreshControl
                            title={"Loading"}
                            titleColor={theme.themeColor}
                            colors={[theme.themeColor]}
                            refreshing={store.isLoading}
                            onRefresh={() => {
                                this.loadData(true)
                            }}
                            tintColor={theme.themeColor}
                        />
                    }
                />
                <Toast ref={'toast'} position={"center"}/>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    favorite: state.favorite
});

//将dispatch创建函数关联到props中，即可以用props.onLoadPopularData代替这个dispatch
const mapDispatchToProps = dispatch => ({
    onLoadFavoriteData: (storeName, isShowLoading) => dispatch(actions.onLoadFavoriteData(storeName, isShowLoading)),
});
//注意：connect只是一个function，并不是非要export的组件才能使用
const FavoriteTabPage = connect(mapStateToProps, mapDispatchToProps)(FavoriteTab);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    },
    tabStyle: {
        minWidth: 50
    },
    indicatorStyles: {
        height: 2,
        backgroundColor: "white"
    },
    labelStyle: {
        fontSize: 13,
    },
    indicatorContainer: {
        alignItems: "center"
    },
    indicator: {
        color: "red",
        margin: 10
    }
});