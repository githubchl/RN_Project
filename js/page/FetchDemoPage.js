import React, {Component} from "react";
import {View, Text, Button, StyleSheet,
TextInput} from "react-native";

export default class FetchDemoPage extends Component {
    constructor(props){
        super(props)
        this.state = {
            showText:""
        }
    }
    loadData(){
        //https://api.github.com/search/repositories?q=java
        let url = `https://api.github.com/search/repositories?q=${this.searchKey}`;
        fetch(url)
            .then(response=>{
                if (response.ok){
                    return response.text()
                }
                throw new Error('Network response was not ok.')
            })
            .then(responseText=>{
                this.setState({
                    showText:responseText
                })
            }).catch(e=>{
                this.setState({
                    showText:e.toString()
                })
        })
    }


    render() {
        const {navigation} = this.props;
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    FetchDemoPage
                </Text>
                <View style={styles.searchView}>
                    <TextInput
                        style={styles.input}
                        onChangeText={text=>{
                            this.searchKey = text;
                        }}
                    />
                    <Button
                        title={'获取'}
                        onPress={()=>{
                            this.loadData();
                        }}
                    />
                </View>
                <Text>
                    {this.state.showText}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#F5F5F5"
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    },
    searchView:{
        flexDirection:"row",
        alignItems:"center"
    },
    input:{
        height:30,
        flex:1,
        marginRight:20,
        borderColor:'black',
        borderWidth:1,
    }
});

