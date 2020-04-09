import React, {Component} from "react"
import {ViewPropTypes, View, Text, StatusBar, StyleSheet, Platform} from "react-native"
import {PropTypes} from "prop-types"

const NAV_BAR_HEIGHT_IOS = 44;//导航栏在IOS中高度
const NAV_BAR_HEIGHT_ANDROID = 50;//导航栏在Android中高度
const STATUS_BAR_HEIGHT = 20;//状态栏高度

const StatusBarShape = {//设置状态栏所接受的属性
    barStyle: PropTypes.oneOf(["light-content", "default"]),
    hidden: PropTypes.bool,
    backgroundColor: PropTypes.string,
};

export default class NavigationBar extends Component {
    //提供类型检查属性
    static propTypes = {
        style: ViewPropTypes.style,
        title: PropTypes.string,
        titleView: PropTypes.element,
        titleLayoutStyle: ViewPropTypes.style,
        hide: PropTypes.bool,
        statusBar: PropTypes.shape(StatusBarShape),
        rightButton: PropTypes.element,
        leftButton: PropTypes.element,
    };

    //设置默认属性
    static defaultProps = {
        statusBar: {
            barStyle: "light-content",
            hidden: false,
        }
    };

    getButtonElement(data) {
        return (
            <View style={styles.navBarButton}>
                {data ? data : null}
            </View>
        )
    }

    render() {
        let statusBar = !this.props.statusBar.hidden ?
            <View style={styles.statusBar}>
                <StatusBar {...this.props.statusBar}/>
            </View> : null;

        let titleView = this.props.titleView ? this.props.titleView :
            <Text ellipsizeMode={"head"} numberOfLines={1} style={styles.title}>{this.props.title}</Text>;

        let content = this.props.hide ? null :
            <View style={styles.narBar}>
                {this.getButtonElement(this.props.leftButton)}
                <View style={[styles.narBarTitleContainer, this.props.titleLayoutStyle]}>
                    {titleView}
                </View>
                {this.getButtonElement(this.props.rightButton)}
            </View>

        return (
            <View style={[styles.container, this.props.style]}>
                {statusBar}
                {content}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#7799cc",
    },
    statusBar: {
        height: Platform.OS === "ios" ? STATUS_BAR_HEIGHT : 0,
    },
    title: {
        fontSize: 20,
        color: "white",
        paddingRight:30,
    },
    narBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: Platform.OS === "ios" ? NAV_BAR_HEIGHT_IOS : NAV_BAR_HEIGHT_ANDROID,
    },
    navBarButton: {
        alignItems: "center",
    },
    narBarTitleContainer: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 40,
        right: 40,
        top: 0,
        bottom: 0,
    },
});