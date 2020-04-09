import React, {Component} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import NavigationBar from "../common/NavigationBar";
import ViewUtil from "../util/ViewUtil"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import {WebView} from "react-native-webview"
import NavigationUtil from "../navigator/NavigationUtil";
import BackPressComponent from "../common/BackPressComponent";
import FavoriteDao from "../expand/dao/FavoriteDao";
import {connect} from "react-redux";


const TRENDING_URL = "https://github.com/";

class DetailPage extends Component {

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        const {projectModel, flag} = this.params;
        this.favoriteDao = new FavoriteDao(flag);

        this.url = projectModel.item.html_url || TRENDING_URL + projectModel.item.fullName;
        const title = projectModel.item.full_name || projectModel.item.fullName;
        this.state = {
            title: title,
            url: this.url,
            canGoBack: false,
            isFavorite: projectModel.isFavorite,
        }
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

    onFavoriteButtonClick() {
        const {projectModel,callback} = this.params;
        const isFavorite = projectModel.isFavorite = !projectModel.isFavorite;
        callback(isFavorite);
        this.setState({
            isFavorite:isFavorite,
        })
        let key = projectModel.item.fullName ? projectModel.item.fileName:projectModel.item.id.toString();
        if (projectModel.isFavorite){
            this.favoriteDao.saveFavoriteItem(key,JSON.stringify(projectModel.item));
        } else {
            this.favoriteDao.removeFavoriteItem(key);
        }
    }

    renderRightButton() {
        return (<View style={{flexDirection: "row"}}>
            <TouchableOpacity
                onPress={() => {
                    this.onFavoriteButtonClick();
                }}>
                <FontAwesome
                    name={this.state.isFavorite ? "star" : "star-o"}
                    size={20}
                    style={{color: "white", marginRight: 10}}
                />
            </TouchableOpacity>
            {ViewUtil.getShareButton(() => {

            })}
        </View>)
    }

    onNavigationStateChange(navState) {
        this.setState({
            canGoBack: navState.canGoBack,
            url: navState.url,
        })
    }

    render() {
        console.log("url:" + this.state.url);
        const {theme} = this.props;

        let navigationBar = <NavigationBar
            leftButton={ViewUtil.getLeftBackButton(() => this.onBack())}
            rightButton={this.renderRightButton()}
            title={this.state.title}
            style={{backgroundColor: theme.themeColor}}
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

const mapStateToProps = state => ({
    theme:state.theme.theme,
});

export default connect(mapStateToProps)(DetailPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})