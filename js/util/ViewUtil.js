import {TouchableOpacity, StyleSheet, View, Text} from "react-native";
import React, {Component} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {THEME_COLOR} from "../common/CommonUtil";

export default class ViewUtil extends Component {

    static getSettingItem(callBack, text, color, Icons, Icon, expandableIcon) {
        return (
            <TouchableOpacity
                onPress={callBack}
                style={styles.setting_item_container}
            >
                <View style={{alignItems: "center", flexDirection: "row"}}>
                    {Icons && Icon ? <Icons
                            name={Icon}
                            size={16}
                            style={{color: color, marginRight: 10}}
                        /> :
                        <View style={{opacity: 1, width: 16, height: 16, marginRight: 10}}></View>}
                    <Text>{text}</Text>
                </View>
                <Ionicons
                    name={expandableIcon ? expandableIcon : "ios-arrow-forward"}
                    size={16}
                    style={{
                        marginRight: 10,
                        alignSelf: "center",
                        color: color || THEME_COLOR,
                    }}
                />
            </TouchableOpacity>
        )
    }

    static getMenuItem(callback, menu, color, expandableIcon) {
        return ViewUtil.getSettingItem(callback, menu.name, color, menu.Icons, menu.Icon, expandableIcon);
    }

    static getLeftBackButton(callBack) {
        return <TouchableOpacity
            style={{padding: 8, paddingLeft: 12}}
            onPress={callBack}>
            <Ionicons
                name={'ios-arrow-back'}
                size={26}
                style={{color: "white"}}
            />
        </TouchableOpacity>
    }

    static getRightButton(title, callBack) {
        return <TouchableOpacity
            style={{alignItems: "center"}}
            onPress={callBack}
        >
            <Text style={{fontSize: 16, color: "white", marginRight: 10}}>{title}</Text>
        </TouchableOpacity>
    }

    static getShareButton(callback) {
        return <TouchableOpacity
            underlayColor={'transparent'}
            onPress={callback}>
            <Ionicons
                name={'md-share'}
                size={20}
                style={{color: "white", opacity: 0.9, marginRight: 10}}
            />
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    setting_item_container: {
        backgroundColor: "white",
        padding: 10,
        height: 60,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
    }
})