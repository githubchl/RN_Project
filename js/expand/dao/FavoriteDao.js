import {AsyncStorage} from "react-native";
const FAVORITE_KEY_PREFIX = "favorite_";

export default class FavoriteDao {
    constructor(flag){
        this.favoriteKey = FAVORITE_KEY_PREFIX+flag;
    }

    /**
     * 收藏项目，保存收藏的项目
     * @param key
     * @param value
     * @param callback
     */
    saveFavoriteItem(key,value,callback){

        AsyncStorage.setItem(key,value,(error,result)=>{
            if (!error){
                //更新Favorite的key
                this.updateFavoriteKeys(key,true);
           }
        });
    }

    /**
     * 更新Favorite key集合
     * @param key
     * @param isAdd true添加，false删除
     */
    updateFavoriteKeys(key,isAdd){
        AsyncStorage.getItem(this.favoriteKey,(error,result)=>{
            if (!error){

                let favoriteKeys = [];
                if (result){
                    favoriteKeys = JSON.parse(result);
                }
                let index = favoriteKeys.indexOf(key);
                if (isAdd){//如果是添加且key不存在则添加到数组中
                    if (index === -1) favoriteKeys.push(key);
                } else{
                    if (index!==-1) favoriteKeys.splice(index,1);
                }

                //更新
                AsyncStorage.setItem(this.favoriteKey,JSON.stringify(favoriteKeys));
            }
        })
    }

    /**
     * 获取收藏列表
     * @returns {Promise<any> | Promise}
     */
    getFavoriteKeys(){
        return new Promise(((resolve, reject) => {
            AsyncStorage.getItem(this.favoriteKey,(error,result)=>{
                if (!error){
                    try {
                        // console.log("this.favoriteKey："+this.favoriteKey);
                        // console.log("key列表："+JSON.parse(result));
                        resolve(JSON.parse(result));
                    }catch (e) {
                        reject(e);
                    }
                } else{
                    reject(error);
                }
            })
        }))
    }

    /**
     * 取消收藏，移除已经收藏的项目
     * @param key
     */
    removeFavoriteItem(key){
        AsyncStorage.removeItem(key,(error,result)=>{

            if (!error){
                console.log("removeFavoriteItem成功");
                console.log("this.favoriteKey:"+this.favoriteKey);
                this.updateFavoriteKeys(key,false);
            }else{
                console.log(error)
            }
        })
    }

    /**
     * 获取所有收藏的项目
     */
    getAllItems(){
        return new Promise(((resolve, reject) => {
            this.getFavoriteKeys().then((keys)=>{
                console.log("获取到的keys："+keys);
                let items = [];
                if (keys){
                    AsyncStorage.multiGet(keys,(err,stores)=>{
                        try {
                            stores.map((result,i,store)=>{
                                let key = store[i][0];
                                let value = store[i][1];
                                console.log("解析key："+key);
                                console.log("解析key--value："+value);
                                if (value) items.push(JSON.parse(value))
                            })
                            console.log("解析后的keys："+items.length);
                            resolve(items);
                        }catch (e) {
                            reject(e);
                        }
                    })
                }else{
                    resolve(items);
                }
            }).catch((e)=>{
                reject(e);
            })
        }))
    }
}