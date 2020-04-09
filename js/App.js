import React,{Component} from "react"
import {Provider} from "react-redux"
import AppNavigator from "./navigator/AppNavigator"
import store from "./store/index"

export default class App extends Component{
    render(){
        /**
         * 将store传递给App框架
         */
        return <Provider store={store}>
            <AppNavigator/>
        </Provider>
    }
}