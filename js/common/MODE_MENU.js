import Octicons from "react-native-vector-icons/Octicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Ionicons from "react-native-vector-icons/Ionicons"

export const MORE_MENU = {
    Custom_language: {name: '自定义语言', Icons: Ionicons, Icon: "md-checkbox-outline"},
    Sort_language: {name: '语言排序', Icons: MaterialCommunityIcons, Icon: "sort"},
    Custom_Theme: {name: '自定义主题', Icons: Ionicons, Icon: "ios-color-palette"},
    Custom_Key: {name: '自定义标签', Icons: Ionicons, Icon: "md-checkbox-outline"},
    Sort_Key: {name: '标签排序', Icons: MaterialCommunityIcons, Icon: "sort"},
    Remove_Key: {name: '标签移除', Icons: Ionicons, Icon: "md-remove"},
    About_Author: {name: '关于作者', Icons: Octicons, Icon: "smiley"},
    About: {name: '关于', Icons: Ionicons, Icon: "logo-github"},
    Tutorial: {name: '教程', Icons: Ionicons, Icon: "ios-bookmarks"},
    Feedback: {name: '反馈', Icons: MaterialIcons, Icon: "feedback"},
    Share: {name: '分享', Icons: Ionicons, Icon: "md-share"},
}