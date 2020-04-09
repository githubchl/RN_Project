import React, {Component} from "react";
import {View, Text, StyleSheet,Clipboard, Linking} from "react-native";
import GlobalStyles from "../../res/styles/GlobalStyles";
import ViewUtil from "../../util/ViewUtil";
import AboutCommon, {FLAG_ABOUT} from "./AboutCommon";
import config from "../../res/data/config"
import NavigationUtil from "../../navigator/NavigationUtil";
import Ionicons from "react-native-vector-icons/Ionicons"
import Toast from "react-native-easy-toast"


export default class AboutMePage extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.aboutCommon = new AboutCommon({
            ...this.params,
            navigation: this.props.navigation,
            flagAbout: FLAG_ABOUT.flag_about_me,
        }, data => this.setState({...data}))
        this.state = {
            data: config,
            showTutorial: true,
            showBlog: false,
            showQQ: false,
            showContact: false,
        }
    }

    componentDidMount() {
        this.aboutCommon.componentDidMount();
    }

    componentWillUnmount() {
        this.aboutCommon.componentWillUnmount();
    }


    onClick(menu) {
        if (!menu) return;
        if (menu.url) {
            const {theme} = this.params;
            NavigationUtil.goPage("WebViewPage", {title: menu.title, url: menu.url,theme:theme});
        }

        if (menu.account && menu.account.indexOf('@') != -1) {//邮箱
            const url = "mailto://" + menu.account;
            Linking.canOpenURL(url).then(support => {
                if (!support) {
                    console.log("不支持的邮箱地址");
                } else {
                    Linking.openURL(url);
                }
            }).catch((e) => {
                console.error("检查邮箱地址发生错误：" + e);
            });
            return;
        }
        if (menu.account) {
            Clipboard.setString(menu.account);
            this.refs.toast.show(menu.title+menu.account+"已复制到剪切板。");
        }
    }


    _item(menu, isShow, key) {
        const {theme} = this.params;
        return ViewUtil.getSettingItem(() => {
            this.setState({
                [key]: !this.state[key],
            })
        }, menu.name, theme.themeColor, Ionicons, menu.icon, isShow ? 'ios-arrow-up' : 'ios-arrow-down')
    }

    renderItems(dic, isShowAccount) {
        const {theme} = this.params;
        if (!dic) return null;
        let views = [];
        for (let i in dic) {
            let title = isShowAccount ? dic[i].title + ":" + dic[i].account : dic[i].title;
            views.push(
                <View key={[i]}>
                    {ViewUtil.getSettingItem(() => this.onClick(dic[i]), title, theme.themeColor)}
                    <View style={GlobalStyles.line}></View>
                </View>
            )
        }
        return views;
    }


    render() {
        const content = <View>
            {this._item(this.state.data.aboutMe.Tutorial, this.state.showTutorial, "showTutorial")}
            <View style={GlobalStyles.line}></View>
            {this.state.showTutorial ? this.renderItems(this.state.data.aboutMe.Tutorial.items) : null}

            {this._item(this.state.data.aboutMe.Blog, this.state.showBlog, "showBlog")}
            <View style={GlobalStyles.line}></View>
            {this.state.showBlog ? this.renderItems(this.state.data.aboutMe.Blog.items) : null}

            {this._item(this.state.data.aboutMe.QQ, this.state.showQQ, "showQQ")}
            <View style={GlobalStyles.line}></View>
            {this.state.showQQ ? this.renderItems(this.state.data.aboutMe.QQ.items) : null}

            {this._item(this.state.data.aboutMe.Contact, this.state.showContact, "showContact")}
            <View style={GlobalStyles.line}></View>
            {this.state.showContact ? this.renderItems(this.state.data.aboutMe.Contact.items) : null}
        </View>
        return (
            <View style={{flex:1}}>
                {this.aboutCommon.render(content, this.state.data.author)}
                <Toast ref={'toast'} position={"bottom"}/>
            </View>

        );
    }
}
