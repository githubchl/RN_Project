import React,{Component} from "react";
import {BackHandler} from "react-native";

/**
 * Android物理返回键处理
 */
export default class BackPressComponent {
    constructor(props){
        this._hardwareBackPress = this.onHardwareBackPress.bind(this);
        this.props = props;
    }

    componentDidMount(){
        if (this.props.backPress) {
            BackHandler.addEventListener("hardwareBackPress",this._hardwareBackPress)
        }
    }

    componentWillUnmount(){
        if (this.props.backPress) {
            BackHandler.removeEventListener("hardwareBackPress",this._hardwareBackPress)
        }
    }

    //物理按键回调
    onHardwareBackPress(e){
        //之间调用外部传递进来的backPress方法
        return this.props.backPress(e);
    }
}