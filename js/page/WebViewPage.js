import React, {Component} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import NavigationBar from "../common/NavigationBar";
import ViewUtil from "../util/ViewUtil"
import {WebView} from "react-native-webview"
import NavigationUtil from "../navigator/NavigationUtil";
import BackPressComponent from "../common/BackPressComponent";



const TRENDING_URL = "https://github.com/";

export default class WebViewPage extends Component {

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        const {title,url} = this.params;
        this.state = {
            title: title,
            url: url,
            canGoBack: false,
        }
        this.backPress = new BackPressComponent({
            backPress: () => this.onBackPress()
        })
    }

    componentDidMount() {
        console.log("WebViewPage-componentDidMount");
        this.backPress.componentDidMount();
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount()
    }

    onBackPress() {
        this.onBack();
        return true;
    };

    onBack() {
        if (this.state.canGoBack) {
            this.webView.goBack();
        } else {
            NavigationUtil.goBack();
        }
    }


    onNavigationStateChange(navState) {
        this.setState({
            canGoBack: navState.canGoBack,
            url: navState.url,
        })
    }

    render() {
        const {theme} = this.params;
        console.log("url:" + this.state.url);

        let navigationBar = <NavigationBar
            title={this.state.title}
            style={{backgroundColor: theme.themeColor}}
            leftButton={ViewUtil.getLeftBackButton(()=>this.onBackPress())}
        />;

        return (
            <View style={styles.container}>
                {navigationBar}
                <WebView
                    source={{uri: this.state.url}}
                    ref={webView => this.webView = webView}
                    startInLoadingState={true}
                    onNavigationStateChange={e => this.onNavigationStateChange(e)}
                />
            </View>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})