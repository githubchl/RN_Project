import React from "react";
import {BackHandler, Platform, Dimensions, StyleSheet} from "react-native"
import BackPressComponent from "../../common/BackPressComponent"
import NavigationUtil from "../../navigator/NavigationUtil";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import {View, Text, Image} from "react-native"
import config from "../../res/data/config"
import {THEME_COLOR} from "../../common/CommonUtil";
import GlobalStyles from "../../res/styles/GlobalStyles";
import ViewUtil from "../../util/ViewUtil";

const AVATAR_SIZE = 90;
const PARALLAX_HEADER_HEIGHT = 270;
const STICKY_HEADER_HEIGHT = (Platform.OS === "ios") ? GlobalStyles.nav_bar_height_ios : GlobalStyles.nav_bar_height_android;
const window = Dimensions.get('window');

export const FLAG_ABOUT = {flag_about: "about", flag_about_me: "about_me"};

export default class AboutCommon extends React.Component{
    constructor(props, updateState) {
        super(props);
        this.props = props;
        this.updateState = updateState;
        this.backPress = new BackPressComponent({backPress: () => this.onBackPress()})
        //本地加载
        // this.updateState({
        //     data:config
        // })
    }

    onBackPress() {
        NavigationUtil.goBack();
        return true;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        //网络加载
        fetch("https://www.devio.org/io/GitHubPopular/json/github_app_config.json")
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Network Error");
            })
            .then(config => {
                if (config) {
                    this.updateState({
                        data: config
                    })
                }
            })
            .catch(e => {
                console.log(e);
            })
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    onShare() {

    }

    getParallaxRenderConfig(params) {
        let config = {};
        let avatar = typeof (params.avatar) === "string" ? {uri: params.avatar} : params.avatar;
        config.renderBackground = () => (
            <View key={"background"}>
                <Image source={{
                    uri: params.backgroundImg,
                    width: window.width,
                    height: PARALLAX_HEADER_HEIGHT
                }}
                />
                <View style={{
                    position: "absolute",
                    top: 0,
                    width: window.width,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    height: PARALLAX_HEADER_HEIGHT
                }}/>
            </View>
        );

        config.renderForeground = () => (
            <View
                key={"parallax-header"} style={styles.parallaxHeader}>
                <Image style={styles.avatar}
                       source={avatar}/>
                <Text style={styles.sectionSpeakerText}>
                    {params.name}
                </Text>
                <Text style={styles.sectionTitleText}>
                    {params.description}
                </Text>
            </View>
        );
        // config.renderStickyHeader = () => (
        //     <View key={"sticky-header"} style={styles.stickySection}>
        //         <Text style={styles.stickySectionText}>{params.name}</Text>
        //     </View>
        // );

        config.renderFixedHeader = () => (
            <View key={"fixed-header"} style={styles.fixedSection}>
                {ViewUtil.getLeftBackButton(() => {
                    NavigationUtil.goBack();
                })}
                {ViewUtil.getShareButton(() => {
                    this.onShare();
                })}
            </View>
        )
        return config
    }


    render(contentView, params) {
        const renderConfig = this.getParallaxRenderConfig(params);
        return (
            <ParallaxScrollView
                backgroundColor={THEME_COLOR}
                contentBackgroundColor={GlobalStyles.backgroundColor}
                parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
                stickyHeaderHeight={STICKY_HEADER_HEIGHT}
                backgroundScrollSpeed={10}
                {...renderConfig}
            >
                {contentView}
            </ParallaxScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        width: window.width,
        height: PARALLAX_HEADER_HEIGHT
    },
    stickySection: {
        position: "absolute",
        left: 0,
        top:0,
        height: STICKY_HEADER_HEIGHT,
        backgroundColor:THEME_COLOR,
        justifyContent: "center",
    },
    stickySectionText:{
        fontSize:20,
        color:"white",
    },
    fixedSection: {
        position: "absolute",
        right: 0,
        left: 0,
        paddingLeft:8,
        paddingRight:8,
        alignItems:"center",
        flexDirection: "row",
        justifyContent:"space-between"
    },
    fixedSectionText: {
        color: "#999",
        fontSize: 20
    },
    parallaxHeader: {
        alignItems: "center",
        flex: 1,
        flexDirection: "column",
        paddingTop: 100
    },
    avatar: {
        marginBottom: 10,
        borderRadius: AVATAR_SIZE / 2
    },
    sectionSpeakerText: {
        color: "white",
        fontSize: 24,
        paddingVertical: 5,
    },
    sectionTitleText: {
        color: "white",
        fontSize: 18,
        paddingVertical: 5,
        paddingHorizontal: 5,
    }
})