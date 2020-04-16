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
import EventBus from "react-native-event-bus";
import EventTypes from "../util/EventTypes"
import {FLAG_LANGUAGE} from "../expand/dao/LanguageDao";
import ArrayUtil from "../util/ArrayUtil";

const URL = "https://api.github.com/search/repositories?q=";
const QUERY_STR = "&sort=stars";//排序规则，按点赞数排序
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);

class PopularPage extends Component {
    constructor(props) {
        super(props);
        //this.tabNames = ['Java', "Android", "IOS", "React", "React Native", "PHP"]
        const {onLoadLanguage} = this.props;
        onLoadLanguage(FLAG_LANGUAGE.flag_key);

        this.preKeys = [];

        console.log("PopularPage----constructor");
    }

    _getTabs() {

        if (!this.tabNav || !ArrayUtil.isEqual(this.preKeys, this.props.keys)) {
            console.log("_getTabs--popular");
            const tabs = {};
            const {keys, theme} = this.props;

            this.preKeys = keys;
            keys.forEach((item, index) => {
                if (item.checked) {
                    tabs[`tab${index}`] = {
                        screen: props => <PopularTabPage
                            {...props}
                            tabLabel={item.name}
                            theme={theme}
                        />,
                        navigationOptions: {
                            title: item.name,
                        }
                    }
                }
            });
            return tabs;
        }
    }

    render() {
        console.log("PopularPage----render");
        const {keys, theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: "light-content",
        };
        let navigationBar = <NavigationBar
            title={"最热"}
            statusBar={statusBar}
            style={{backgroundColor: theme.themeColor}}
        />;
        const TabNavigator = keys.length > 0 ? createAppContainer(
            createMaterialTopTabNavigator(
                this._getTabs(),
                {
                    tabBarOptions: {
                        tabStyle: styles.tabStyle,
                        upperCaseLabel: false,
                        scrollEnabled: true,
                        style: {
                            backgroundColor: theme.themeColor
                        },
                        indicatorStyles: styles.indicatorStyles,
                        labelStyle: styles.labelStyle
                    },
                    lazy: true,//懒加载
                }
            )) : null;
        return (
            <View style={styles.container}>
                {navigationBar}
                {TabNavigator && <TabNavigator/>}
            </View>
        );
    }
}

const mapPopularStateToProps = state => ({
    keys: state.language.keys,
    theme: state.theme.theme,
});

const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(PopularPage);

class PopularTab extends Component {
    constructor(props) {
        super(props);
        const {tabLabel} = this.props;
        this.storeName = tabLabel;
        this.isFavoriteChange = false;
    }

    componentDidMount() {
        this.loadData();
        EventBus.getInstance().addListener(EventTypes.favorite_change_popular, this.favoriteChangeListener = () => {
            this.isFavoriteChange = true;
        })
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.bottomTabSelectListener = (data) => {
            if (data.to === 0 && this.isFavoriteChange) {
                this.loadData(false, true);
            }
        })
    }

    componentWillUnmount() {
        EventBus.getInstance().removeListener(this.favoriteChangeListener);
        EventBus.getInstance().removeListener(this.bottomTabSelectListener);
    }

    _store() {
        const {popular} = this.props;
        let store = popular[this.storeName];
        if (!store) {
            store = {
                items: [],
                isLoading: false,
                projectModes: [],//要显示的数据
                hideLoadingMore: true,//默认隐藏加载更多
            }
        }
        return store;
    }

    loadData(loadMore, refreshFavorite) {
        const {onLoadPopularData, onLoadMorePopular, onFlushPopularFavorite} = this.props;
        const store = this._store();
        const url = this.genFetchUrl(this.storeName);
        if (loadMore) {
            onLoadMorePopular(this.storeName, ++store.pageIndex, pageSize, store.items, favoriteDao, callback => {
                this.refs.toast.show("没有更多了")
            });
        } else if (refreshFavorite) {
            onFlushPopularFavorite(this.storeName, store.pageIndex, pageSize, store.items, favoriteDao);
        }
        else {
            onLoadPopularData(this.storeName, url, pageSize, favoriteDao);
        }
    }

    genFetchUrl(key) {
        return URL + key + QUERY_STR;
    }

    renderItem(data) {
        const item = data.item;
        const {theme} = this.props;
        return <PopularItem
            projectModel={item}
            theme={theme}
            onSelect={(callback) => {
                NavigationUtil.goPage("DetailPage", {
                    projectModel: item,
                    flag: FLAG_STORAGE.flag_popular,
                    callback
                })
            }}
            onFavorite={(item, isFavorite) => {
                FavoriteUtil.onFavorite(favoriteDao, item, isFavorite, FLAG_STORAGE.flag_popular);
            }}
        />
    }

    genIndicator() {
        return this._store().hideLoadingMore ? null :
            <View style={styles.indicatorContainer}>
                <ActivityIndicator
                    style={styles.indicator}
                />
                <Text>正在加载更多</Text>
            </View>
    }

    render() {
        let store = this._store();
        const {theme} = this.props;

        return (
            <View style={styles.container}>
                <FlatList
                    data={store.projectModes}
                    renderItem={(data) =>
                        this.renderItem(data)}
                    keyExtractor={item => "" + item.item.id}
                    refreshControl={
                        <RefreshControl
                            title={"Loading"}
                            titleColor={theme.themeColor}
                            colors={[theme.themeColor]}
                            refreshing={store.isLoading}
                            onRefresh={() => {
                                this.loadData()
                            }}
                            tintColor={theme.themeColor}
                        />
                    }
                    ListFooterComponent={() => this.genIndicator()}
                    onEndReached={() => {
                        setTimeout(() => {
                            if (this.canLoadMore) {
                                this.loadData(true);
                                this.canLoadMore = false;
                            }
                        }, 100);
                    }}
                    onEndReachedThreshold={0.5}
                    onMomentumScrollBegin={() => {
                        this.canLoadMore = true;
                    }}
                />
                <Toast ref={'toast'} position={"center"}/>
            </View>
        )
    }
}


const mapStateToProps = state => ({
    popular: state.popular
});

//将dispatch创建函数关联到props中，即可以用props.onLoadPopularData代替这个dispatch
const mapDispatchToProps = dispatch => ({
    onLoadPopularData: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onLoadPopularData(storeName, url, pageSize, favoriteDao)),
    onLoadMorePopular: (storeName, pageIndex, pageSize, items, favoriteDao, callback) => dispatch(actions.onLoadMorePopular(storeName, pageIndex, pageSize, items, favoriteDao, callback)),
    onFlushPopularFavorite: (storeName, pageIndex, pageSize, items, favoriteDao) => dispatch(actions.onFlushPopularFavorite(storeName, pageIndex, pageSize, items, favoriteDao))
});
//注意：connect只是一个function，并不是非要export的组件才能使用
const PopularTabPage = connect(mapStateToProps, mapDispatchToProps)(PopularTab);

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