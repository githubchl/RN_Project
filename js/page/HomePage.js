import React, {Component} from "react";
import {View, Text, StyleSheet, ToastAndroid} from "react-native";
import DynamicTabNavigator from "../navigator/DynamicTabNavigator"
import NavigationUtil from "../navigator/NavigationUtil";
import BackPressComponent from "../common/BackPressComponent";
import CustomDialog from "./CustomDialog"
import {connect} from "react-redux";
import actions from "../action/index"


class HomePage extends Component {

    constructor(props) {
        super(props);
        this.backPress = new BackPressComponent({
            backPress: () => this.onBackPress()
        })
    }

    componentDidMount() {
        this.backPress.componentDidMount();
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount()
    }

    onBackPress() {
        if (this.lastBackPressed && this.lastBackPressed + 5000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            return false;
        }
        this.lastBackPressed = Date.now();
        ToastAndroid.show('再按一次退出应用', 1500);
        return false;

    };

    renderCustomThemeView() {
        const {customThemeViewVisible, onShowCustomThemeView} = this.props;
        return (
            <CustomDialog
                visible={customThemeViewVisible}
                {...this.props}
                onClose={() => onShowCustomThemeView(false)}
            />
        )
    }

    render() {
        NavigationUtil.navigation = this.props.navigation;
        return <View style={styles.container}>
            <DynamicTabNavigator/>
            {this.renderCustomThemeView()}
        </View>
    }
}

const mapStateToProps = state => ({
    nav: state.nav,
    customThemeViewVisible: state.theme.customThemeViewVisible
})

const mapDispatchToProps = dispatch => ({
    onShowCustomThemeView: (show) => dispatch(actions.onShowCustomThemeView(show))
})

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    }
});