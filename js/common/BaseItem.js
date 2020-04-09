import React, {Component} from "react";
import {View, TouchableOpacity, Text, Image, StyleSheet} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome"
import HTMLView from "react-native-htmlview";
import {PropTypes} from "prop-types";

export default class BaseItem extends Component {
    static propTypes = {
        projectModel: PropTypes.object,
        onSelect: PropTypes.func,
        onFavorite: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            isFavorite: this.props.projectModel.isFavorite,//初始化的收藏状态
        }
    }

    onItemClick(){
        this.props.onSelect(isFavorite=>{
            this.setFavoriteState(isFavorite);
        })
    }

    /**
     * props变化时调用
     * @param nextProps
     * @param prevState
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        const isFavorite = nextProps.projectModel.isFavorite;
        if (prevState.isFavorite !== isFavorite) {
            return {
                isFavorite: isFavorite,
            }
        }
        return null;
    }

    setFavoriteState(isFavorite){
        this.props.projectModel.isFavorite = isFavorite;
        this.setState({
            isFavorite:isFavorite,
        })
    }

    onPressFavorite() {
        this.setFavoriteState(!this.state.isFavorite);
        //改变收藏状态
        this.props.onFavorite(this.props.projectModel.item, !this.state.isFavorite);
    }

    _favoriteIcon() {
        const {theme} = this.props;
        return <TouchableOpacity
            style={{padding: 6}}
            underlayColor={'transparent'}
            onPress={() => this.onPressFavorite()}>
            <FontAwesome
                name={this.state.isFavorite ? "star" : "star-o"}
                size={26}
                style={{color: theme.themeColor}}/>
        </TouchableOpacity>
    }
}


const styles = StyleSheet.create({
    row: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center"
    },
    cell_container: {
        backgroundColor: "white",
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginVertical: 3,
        borderColor: "#dddddd",
        borderWidth: 0.5,
        borderRadius: 2,
        shadowColor: 'gray',
        shadowOffset: {width: 0.5, height: 0.5},
        shadowOpacity: 0.4,
        shadowRadius: 1,
        elevation: 2
    },
    title: {
        fontSize: 16,
        marginBottom: 2,
        color: "#212121"
    },
    description: {
        fontSize: 14,
        marginBottom: 2,
        color: "#757575"
    }
})

