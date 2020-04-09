import React, {Component} from "react";
import {View, Text, TextInput, Button, StyleSheet} from "react-native"
import DataStore from "../expand/dao/DataStore"

type Props = {};
const KEY = "save_key";
export default class DataStoreDemoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showText: ""
        }
        this.dataStore = new DataStore();
    }

    loadData(){
        let url = `https://api.github.com/search/repositories?q=${this.value}`;
        this.dataStore.fetchData(url)
            .then(data=>{
                let showData = `初次加载数据时间：${new Date(data.timestamp)}\n${JSON.stringify(data.data)}`;
                this.setState({
                    showText : showData,
                })
            })
            .catch(error=>{
                error&&console.log(error.toString());
        })
    }

    render() {
        return (
            <View>
                <Text>离线缓存框架设计</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={text=>{
                        this.value = text;
                    }}
                />
                <Button
                title={"加载数据"}
                onPress={()=>{
                    this.loadData();
                }}
                />
                <Text>
                    {this.state.showText}
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        borderColor: "black",
        borderWidth: 1,
        height: 30
    }
})
