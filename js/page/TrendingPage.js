import React, {Component} from "react";
import {
    View, Text, Button, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity,
    DeviceEventEmitter
} from "react-native";
import {connect} from "react-redux";
import actions from "../action/index"
import {createMaterialTopTabNavigator} from "react-navigation-tabs"
import {createAppContainer} from "react-navigation"
import TrendingItem from "../common/TrendingItem"
import NavigationBar from "../common/NavigationBar"
import Toast from "react-native-easy-toast"
import NavigationUtil from "../navigator/NavigationUtil";
import DataStoreDemoPage from "./DataStoreDemoPage";
import TrendingDialog, {TimeSpans} from "../common/TrendingDialog";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import FavoriteDao from "../expand/dao/FavoriteDao";
import {FLAG_STORAGE} from "../expand/dao/DataStore";
import FavoriteUtil from "../util/FavoriteUtil";
import EventBus from "react-native-event-bus";
import EventTypes from "../util/EventTypes"
import {FLAG_LANGUAGE} from "../expand/dao/LanguageDao";

const URL = "https://github.com/trending/";
const pageSize = 10;
const EVENT_TYPE_TIME_SPAN_CHANGE = "EVENT_TYPE_TIME_SPAN_CHANGE";
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_trending);

class TrendingPage extends Component {
    constructor(props) {
        super(props);
        //this.tabNames = ["CSS", "Python", "C#", "PHP", "JavaScript"];
        this.state = {
            timeSpan: TimeSpans[0],
        }

        const {onLoadLanguage} = this.props;
        onLoadLanguage(FLAG_LANGUAGE.flag_language);

        this.preKeys = [];
    }

    _getTabs() {
        console.log("_getTabs--trending");
        const tabs = {};
        const {languages,theme} = this.props;
        languages.forEach((item, index) => {
            if (item.checked) {
                tabs[`tab${index}`] = {
                    screen: props => <TrendingTabPage
                        {...props}
                        theme={theme}
                        tabLabel={item.name}
                        timeSpan={this.state.timeSpan}
                    />,
                    navigationOptions: {
                        title: item.name,
                    }
                }
            }
        });
        return tabs;
    }

    renderTitleView() {
        return <View>
            <TouchableOpacity
                underlayColor='transparent'
                onPress={() => this.dialog.show()}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, color: "#ffffff", fontWeight: '400'}}>
                        趋势 {this.state.timeSpan.showText}
                    </Text>
                    <MaterialIcons
                        name={'arrow-drop-down'}
                        size={22}
                        style={{color: "white"}}
                    />
                </View>
            </TouchableOpacity>
        </View>
    }

    onSelectTimeSpan(tab) {
        this.dialog.dismiss();
        this.setState({
            timeSpan: tab,
        });
        DeviceEventEmitter.emit(EVENT_TYPE_TIME_SPAN_CHANGE, tab);//提交这个事件，然后在子组件中接收这个事件刷新tab子页面
    }

    renderTrendingDialog() {
        return <TrendingDialog
            ref={dialog => this.dialog = dialog}
            onSelect={tab => this.onSelectTimeSpan(tab)}
        />
    }

    _tabNav() {
        const {theme} = this.props;
        this.tabNav = createAppContainer(
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
                    lazy:true,//懒加载
                }
            ));
        return this.tabNav;
    }

    render() {
        const {languages,theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: "light-content",
        };
        let navigationBar = <NavigationBar
            titleView={this.renderTitleView()}
            statusBar={statusBar}
            style={{backgroundColor: theme.themeColor}}
        />;

        let TabNavigator = languages.length > 0 ? this._tabNav() : null;
        return (
            <View style={styles.container}>
                {navigationBar}
                {TabNavigator ? <TabNavigator/> : null}
                {this.renderTrendingDialog()}
            </View>
        );
    }
}

const mapPopularStateToProps = state => ({
    languages: state.language.languages,
    theme:state.theme.theme,
});

const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(TrendingPage);

class TrendingTab extends Component {
    constructor(props) {
        super(props);
        const {tabLabel} = this.props;
        this.storeName = tabLabel;
        this.timeSpan = this.props.timeSpan;
        this.isFavoriteChange = false;
    }

    componentDidMount() {
        this.loadData();
        //监听接收这个事件
        this.timeSpanChangeListener = DeviceEventEmitter.addListener(EVENT_TYPE_TIME_SPAN_CHANGE, (timeSpan) => {
            this.timeSpan = timeSpan;
            this.loadData();
        });

        EventBus.getInstance().addListener(EventTypes.favorite_change_trending, this.favoriteChangeListener = () => {
            this.isFavoriteChange = true;
        })
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.bottomTabSelectListener = (data) => {
            if (data.to === 1 && this.isFavoriteChange) {
                this.loadData(false, true);
            }
        })

    }

    componentWillUnmount() {
        this.timeSpanChangeListener.remove();
        EventBus.getInstance().removeListener(this.favoriteChangeListener);
        EventBus.getInstance().removeListener(this.bottomTabSelectListener);
    }

    _store() {
        const {trending} = this.props;
        let store = trending[this.storeName];
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
        const {onRefreshTrending, onLoadMoreTrending, onFlushPopularTrending} = this.props;
        const store = this._store();
        const url = this.genFetchUrl(this.storeName);
        if (loadMore) {
            onLoadMoreTrending(this.storeName, ++store.pageIndex, pageSize, store.items, favoriteDao, callback => {
                this.refs.toast.show("没有更多了")
            });
        } else if (refreshFavorite) {
            console.log("refreshFavoriterefreshFavoriterefreshFavoriterefreshFavorite")
            onFlushPopularTrending(this.storeName, store.pageIndex, pageSize, store.items, favoriteDao);
        }
        else {
            onRefreshTrending(this.storeName, url, pageSize, favoriteDao);
        }
    }

    genFetchUrl(key) {
        if (key.toUpperCase() === "ALL") {
            return URL + '?' + this.timeSpan.searchText;
        }
        return URL + key + '?' + this.timeSpan.searchText;
    }

    renderItem(data) {
        const item = data.item;
        const {theme} = this.props;
        return <TrendingItem projectModel={item}
                             theme={theme}
                             onSelect={(callback) => {
                                 NavigationUtil.goPage("DetailPage", {
                                     projectModel: item,
                                     flag: FLAG_STORAGE.flag_trending,
                                     callback
                                 })
                             }}
                             onFavorite={(item, isFavorite) => {
                                 FavoriteUtil.onFavorite(favoriteDao, item, isFavorite, FLAG_STORAGE.flag_trending);
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
                    keyExtractor={item => "" + (item.item.fullName || item.item.id)}
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
    trending: state.trending
});

//将dispatch创建函数关联到props中，即可以用props.onLoadPopularData代替这个dispatch

const mapDispatchToProps = dispatch => ({
    onRefreshTrending: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onRefreshTrending(storeName, url, pageSize, favoriteDao)),
    onLoadMoreTrending: (storeName, pageIndex, pageSize, items, favoriteDao, callback) => dispatch(actions.onLoadMoreTrending(storeName, pageIndex, pageSize, items, favoriteDao, callback)),
    onFlushPopularTrending: (storeName, pageIndex, pageSize, items, favoriteDao) => dispatch(actions.onFlushPopularTrending(storeName, pageIndex, pageSize, items, favoriteDao))
});
//注意：connect只是一个function，并不是非要export的组件才能使用
const TrendingTabPage = connect(mapStateToProps, mapDispatchToProps)(TrendingTab);

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