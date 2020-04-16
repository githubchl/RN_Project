import React, {Component} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, NativeModules, AsyncStorage} from "react-native";
import NavigationUtil from "../navigator/NavigationUtil";
import NavigationBar from "../common/NavigationBar";
import Feather from "react-native-vector-icons/Feather"
import Ionicons from "react-native-vector-icons/Ionicons"
import {MORE_MENU} from "../common/MODE_MENU";
import GlobalStyles from "../res/styles/GlobalStyles";
import ViewUtil from "../util/ViewUtil";
import {FLAG_LANGUAGE} from "../expand/dao/LanguageDao";
import {connect} from "react-redux";
import actions from "../action";
import Modal, {BottomModal, ModalContent, SlideAnimation} from "react-native-modals";

const HEAD_IMAGE = "HEAD_IMAGE";

class MyPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            imagePath: null,
            popupVisible: false,
        }
    }

    componentDidMount() {
        this.getHeadImage();
    }

    getHeadImage() {
        AsyncStorage.getItem(HEAD_IMAGE, (error, result) => {
            if (!error) {
                console.log("result:" + result);
                if (result) {
                    this.setState({
                        imagePath: result
                    })
                }
            }
        });
    }


    getRightButton() {
        return <View style={{flexDirection: "row"}}>
            <TouchableOpacity
                onPress={() => {

                }}
            >
                <View style={{padding: 5, marginRight: 8}}>
                    <Feather
                        name={'search'}
                        size={24}
                        style={{color: "white"}}
                    />
                </View>
            </TouchableOpacity>
        </View>
    }

    getLeftButton(callBack) {
        return <TouchableOpacity style={{padding: 8, paddingLeft: 12}}
                                 onPress={callBack}>
            <Ionicons
                name={'ios-arrow-back'}
                size={26}
                style={{color: "white"}}
            />
        </TouchableOpacity>
    }

    getItem(menu) {
        const {theme} = this.props;
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
            case MORE_MENU.Custom_Key:
            case MORE_MENU.Custom_language:
            case MORE_MENU.Remove_Key:
                RouteName = "CustomKeyPage";
                params.isRemoveKey = menu === MORE_MENU.Remove_Key;
                params.flag = menu === MORE_MENU.Custom_language ? FLAG_LANGUAGE.flag_language : FLAG_LANGUAGE.flag_key;
                break;
            case MORE_MENU.Sort_Key:
            case MORE_MENU.Sort_language:
                RouteName = "SortKeyPage";
                params.flag = menu === MORE_MENU.Sort_language ? FLAG_LANGUAGE.flag_language : FLAG_LANGUAGE.flag_key;
                break;
            case MORE_MENU.About:
                RouteName = "AboutPage";
                break;
            case MORE_MENU.Custom_Theme:
                const {onShowCustomThemeView} = this.props;
                onShowCustomThemeView(true);
                break;
        }
        console.log(RouteName);
        if (RouteName) {
            const {theme} = this.props;
            params.theme = theme;
            NavigationUtil.goPage(RouteName, params);
        }
    }

    //this.closeBottomPopup();

    //拍照
    openCamera() {
        this.closeBottomPopup();
        NativeModules.AlbumModule.openCamera().then((res) => {
            console.log("openCamera--res:" + res);
            if (res) {
                this.setState({
                    imagePath: res,
                });
                this.setHeadImage(res);
            }

        });
    }

    //选择照片
    chooseAlbum() {
        this.closeBottomPopup();
        NativeModules.AlbumModule.chooseAlbum().then((res) => {
            console.log("chooseAlbum--res:" + res);
            if (res) {
                this.setState({
                    imagePath: res,
                });
                this.setHeadImage(res);
            }
        })
    }

    //将照片路径保存到Storage中
    setHeadImage(imagePath) {
        AsyncStorage.setItem(HEAD_IMAGE, imagePath);
    }

    showBottomPopup() {
        this.setState({
            popupVisible: true,
        })
    }

    closeBottomPopup() {
        this.setState({
            popupVisible: false,
        })
    }

    getBottomPopup() {
        return (
            <BottomModal
                visible={this.state.popupVisible}
                onTouchOutside={() => {
                    this.closeBottomPopup();
                }}

                modalAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
            >
                <View>
                    <TouchableOpacity style={styles.popupItem} onPress={() => {
                        this.openCamera();
                    }}>
                        <Text>拍照</Text>
                    </TouchableOpacity>
                    <View style={GlobalStyles.line}></View>
                    <TouchableOpacity style={styles.popupItem} onPress={() => {
                        this.chooseAlbum()
                    }}>
                        <Text>选择照片</Text>
                    </TouchableOpacity>
                    <View style={GlobalStyles.line}></View>
                    <TouchableOpacity style={styles.popupItem} onPress={() => {
                        this.closeBottomPopup()
                    }}>
                        <Text>取消</Text>
                    </TouchableOpacity>
                </View>
            </BottomModal>
        )
    }


    render() {
        const {theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: "light-content",
        };
        let navigationBar =
            <NavigationBar
                title={"我的"}
                statusBar={statusBar}
                style={{backgroundColor: theme.themeColor}}
                /* rightButton={this.getRightButton()}
                 leftButton={this.getLeftButton()}*/
            />;
        return (
            <View style={styles.container}>
                {navigationBar}
                <ScrollView>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => {
                            this.onClick(MORE_MENU.About)
                            // this.jumpNative();
                        }}>
                        <View style={styles.about_left}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.showBottomPopup()
                                }}>
                                {!this.state.imagePath ? <Ionicons
                                    name={MORE_MENU.About.Icon}
                                    size={60}
                                    style={{marginRight: 10, color: theme.themeColor}}
                                /> : <Image source={{uri: `file:///${this.state.imagePath}`}}
                                            style={{width: 60, height: 60, borderRadius: 5}} resizeMode={"cover"}/>}

                            </TouchableOpacity>
                            <Text style={{marginLeft: 10}}>GitHUb Popular</Text>
                        </View>
                        <Ionicons
                            name={"ios-arrow-forward"}
                            size={16}
                            style={{
                                marginRight: 10,
                                alignSelf: "center",
                                color: theme.themeColor,
                            }}
                        />
                    </TouchableOpacity>
                    <View style={GlobalStyles.line}></View>
                    {this.getItem(MORE_MENU.Tutorial)}

                    {/*趋势管理*/}
                    <Text style={styles.groupTitle}>趋势管理</Text>
                    {/*自定义语言*/}
                    {this.getItem(MORE_MENU.Custom_language)}
                    <View style={GlobalStyles.line}></View>
                    {/*语言排序*/}
                    {this.getItem(MORE_MENU.Sort_language)}

                    {/*最热模块*/}
                    <Text style={styles.groupTitle}>最热管理</Text>
                    {/*自定义标签*/}
                    {this.getItem(MORE_MENU.Custom_Key)}
                    <View style={GlobalStyles.line}></View>
                    {/*标签排序*/}
                    {this.getItem(MORE_MENU.Sort_Key)}
                    <View style={GlobalStyles.line}></View>
                    {/*标签移除*/}
                    {this.getItem(MORE_MENU.Remove_Key)}

                    {/*设置*/}
                    <Text style={styles.groupTitle}>设置</Text>
                    {/*自定义主题*/}
                    {this.getItem(MORE_MENU.Custom_Theme)}
                    {/*关于作者*/}
                    {this.getItem(MORE_MENU.About_Author)}
                    <View style={GlobalStyles.line}></View>
                    {/*反馈*/}
                    {this.getItem(MORE_MENU.Feedback)}
                </ScrollView>
                {this.getBottomPopup()}
            </View>
        );
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme,
})

const mapDispatchToProps = dispatch => ({
    onShowCustomThemeView: (show) => dispatch(actions.onShowCustomThemeView(show))
})

export default connect(mapStateToProps, mapDispatchToProps)(MyPage)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5"
    },
    item: {
        backgroundColor: "white",
        padding: 10,
        height: 90,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    about_left: {
        flexDirection: "row",
        alignItems: "center"
    },
    groupTitle: {
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 5,
        fontSize: 12,
        color: 'gray'
    },
    popupItem: {
        backgroundColor: "white",
        padding: 10,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
    }
});