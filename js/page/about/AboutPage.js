import React, {Component} from "react";
import {View, Text, StyleSheet, Button, TouchableOpacity, Image, Linking, NativeModules} from "react-native";
import {MORE_MENU} from "../../common/MODE_MENU";
import GlobalStyles from "../../res/styles/GlobalStyles";
import ViewUtil from "../../util/ViewUtil";
import AboutCommon, {FLAG_ABOUT} from "./AboutCommon";
import config from "../../res/data/config"
import NavigationUtil from "../../navigator/NavigationUtil";


export default class AboutPage extends Component {
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
            imagePath:null
        }
    }

    componentDidMount() {
        this.aboutCommon.componentDidMount();
    }

    componentWillUnmount() {
        this.aboutCommon.componentWillUnmount();
    }

    getItem(menu) {
        const {theme} = this.params;
        return ViewUtil.getMenuItem(() => this.onClick(menu), menu, theme.themeColor);
    }

    onClick(menu) {
        let RouteName, params = {};
        switch (menu) {
            case MORE_MENU.Tutorial:
                RouteName = "WebViewPage";
                params.title = "教程";
                params.url = "https://coding.imooc.com/learn/list/304.html"
                break;
            case MORE_MENU.About_Author:
                RouteName = "AboutMePage";
                break;
            case MORE_MENU.Feedback:
                const url = "mailto://2416709025@qq.com";
                Linking.canOpenURL(url).then(support => {
                    if (!support) {
                        console.log("不支持的邮箱地址");
                    } else {
                        Linking.openURL(url);
                    }
                }).catch((e) => {
                    console.error("检查邮箱地址发生错误：" + e);
                });
                break;
        }
        if (RouteName) {
            const {theme} = this.params;
            params.theme = theme;
            NavigationUtil.goPage(RouteName, params);
        }
    }

    openCamera() {
        console.log("openCamera");
        NativeModules.AlbumModule.callCamera().then((res)=>{
            console.log("res:"+res);
            if (res){
                this.setState({
                    imagePath:res,
                })
            }

        });;
    }

    choosePhoto() {
        NativeModules.AlbumModule.callGallery()
            .then((res)=>{
            console.log("res:"+res);
        });
    }

    render() {
        const content = <View>
            {this.getItem(MORE_MENU.Tutorial)}
            <View style={GlobalStyles.line}></View>
            {this.getItem(MORE_MENU.About_Author)}
            <View style={GlobalStyles.line}></View>
            {this.getItem(MORE_MENU.Feedback)}
            <View>
                <Button onPress={() => this.openCamera()} title="打开相机"/>
                <Button onPress={() => this.choosePhoto()} title="选择相册"/>
            </View>
            {this.state.imagePath?<Image source={{uri:`file:///${this.state.imagePath}`}} style={{width:200, height:200}} resizeMode='contain'/>:null}
        </View>
        return (
            this.aboutCommon.render(content, this.state.data.app)
        );
    }
}
