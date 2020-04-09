import React, {Component} from "react"
import {View, Text, TouchableHighlight, StyleSheet, Alert} from "react-native";
import BackPressComponent from "../common/BackPressComponent";
import NavigationUtil from "../navigator/NavigationUtil";
import LanguageDao, {FLAG_LANGUAGE} from "../expand/dao/LanguageDao";
import actions from "../action";
import {connect} from "react-redux";
import ViewUtil from "../util/ViewUtil";
import CheckBox from "react-native-check-box";
import Ionicons from "react-native-vector-icons/Ionicons"
import NavigationBar from "../common/NavigationBar"
import ArrayUtil from "../util/ArrayUtil";
import SortableListView from "react-native-sortable-listview";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

/**
 * 排序页面
 */

class SortKeyPage extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.backPress = new BackPressComponent({
            backPress: () => this.onBackPress()
        });
        this.changeValues = [];
        this.languageDao = new LanguageDao(this.params.flag);
        this.state = {
            checkedArray: SortKeyPage._keys(this.props),
        }
    }

    //props状态发生变化时会自动调用
    static getDerivedStateFromProps(nextProps, prevState) {
        const checkedArray = SortKeyPage._keys(nextProps, prevState);
        //之前的keys跟现在的比较
        if (prevState.keys !== checkedArray) {
            return {
                keys: checkedArray,
            }
        }
        return null;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        //如果props中标签为空则本地存储中获取标签
        if (SortKeyPage._keys(this.props).length === 0) {
            let {onLoadLanguage} = this.props;
            onLoadLanguage(this.params.flag);
        }
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount()
    }

    /**
     * 获取标签
     * @param props
     * @param state 移除标签时使用
     * @private
     */
    static _keys(props, state) {
        //如果stat人中有checkedArray则使用state中的checkedArray
        if (state && state.checkedArray && state.checkedArray.length) {
            return state.checkedArray;
        }
        //否则从原始数据中获取checkArray
        const flag = SortKeyPage._flag(props);
        let dataArray = props.language[flag] || [];
        let keys = [];
        for (let i = 0; i < dataArray.length; i++) {
            let data = dataArray[i];
            if (data.checked) keys.push(data);
        }
        return keys;
    }

    static _flag(props) {
        const {flag} = props.navigation.state.params;
        return flag === FLAG_LANGUAGE.flag_key ? "keys" : "languages";
    }

    onSave(hasChecked) {
        if (!hasChecked) {
            //如果没有排序则直接返回，通过比较原始数据和state里面的数据
            if (ArrayUtil.isEqual(SortKeyPage._keys(this.props), this.state.checkedArray)) {
                NavigationUtil.goBack();
                return;
            }
        }
        //todo 保存排序后的数据
        //更新本地数据
        this.languageDao.save(this.getSortResult());
        const {onLoadLanguage} = this.props;
        //更新store
        onLoadLanguage(this.params.flag);
        NavigationUtil.goBack();
    }


    getSortResult(){
        const flag = SortKeyPage._flag(this.props);
        //克隆一份排序前的原始所有数据
        let sortResultArray = ArrayUtil.clone(this.props.language[flag]);
        //获取排序之前的排列顺序，这个数组包含了选中的标签
        const originalCheckedArray = SortKeyPage._keys(this.props);

        //遍历排序之前的数据，用排序后的数据checkedArray进行替换
        //originalCheckedArray是排序前的位置，所以先遍历的就是排在前面的，然后用排序好的去替换它
        for (let i = 0; i < originalCheckedArray.length; i++) {
            let item = originalCheckedArray[i];
            //找到要替换的元素所在的位置
            let index = this.props.language[flag].indexOf(item);
            //进行替换
            sortResultArray.splice(index,1,this.state.checkedArray[i]);
        }
        return sortResultArray;
    }


    onBackPress() {
        if (!ArrayUtil.isEqual(SortKeyPage._keys(this.props),this.state.checkedArray)) {
            Alert.alert('提示', "要保存修改吗?", [
                {
                    text: "否",
                    onPress: () => {
                        NavigationUtil.goBack();
                    }
                },
                {
                    text: "是",
                    onPress: () => {
                        this.onSave();
                    }
                }
            ])
        } else {
            NavigationUtil.goBack();
        }
        return true;
    }





    render() {
        const {theme} = this.params;
        let title = this.params.flag === FLAG_LANGUAGE.flag_language ? "语言排序" : "标签排序";
        let navigationBar = <NavigationBar
            title={title}
            style={{backgroundColor: theme.themeColor}}
            leftButton={ViewUtil.getLeftBackButton(() => this.onBackPress())}
            rightButton={ViewUtil.getRightButton("保存", () => this.onSave())}
        />;

        return <View style={styles.container}>
            {navigationBar}
            <SortableListView
                data={this.state.checkedArray}
                order={Object.keys(this.state.checkedArray)}
                onRowMoved={e => {
                    //移动之后，替换元素位置
                    this.state.checkedArray.splice(e.to, 0, this.state.checkedArray.splice(e.from, 1)[0])
                    this.forceUpdate()
                }}
                renderRow={row => <SortCell theme={theme} data={row} {...this.params}/>}
            />
        </View>
    }
}

class SortCell extends Component {
    render() {
        const {theme} = this.props;
        return <TouchableHighlight
            underlayColor={"#eee"}
            style={this.props.data.checked ? styles.item : styles.hidden}
            {...this.props.sortHandlers}
        >
            <View style={{marginLeft: 10, flexDirection: "row"}}>
                <MaterialCommunityIcons
                    name={"sort"}
                    size={16}
                    style={{marginRight: 10, color: theme.themeColor}}
                />
                <Text>{this.props.data.name}</Text>
            </View>

        </TouchableHighlight>
    }
}

const mapStateToProps = state => ({
    language: state.language,
});

const mapDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapStateToProps, mapDispatchToProps)(SortKeyPage);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    item: {
        flexDirection: "row",
    },
    line: {
        flex: 1,
        height: 0.5,
        backgroundColor: "darkgray"
    },
    hidden: {
        height: 0,
    },
    item: {
        backgroundColor: "#F8F8F8",
        borderBottomWidth: 1,
        borderColor: "#eee",
        height: 50,
        justifyContent: "center",
    }
})