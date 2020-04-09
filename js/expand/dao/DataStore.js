import {AsyncStorage} from "react-native";
import GitHubTrending from "GitHubTrending"

export const FLAG_STORAGE = {flag_popular: 'popular', flag_trending: "trending"}

export default class DataStore {

    /**
     * 请求数据
     * @param url
     * @returns {Promise<any> | Promise}
     */
    fetchData(url, flag) {
        return new Promise((resolve, reject) => {
            this.fetchLocalData(url).then((wrapData) => {
                console.log("数据没有过期？" + DataStore.checkTimestampValid(wrapData.timestamp));
                if (wrapData && DataStore.checkTimestampValid(wrapData.timestamp)) {
                    resolve(wrapData);
                } else {
                    this.fetchNetData(url, flag).then((data) => {
                        resolve(this._wrapData(data));
                    }).catch((error) => {
                        reject(error);
                    })
                }
            }).catch((error) => {
                console.log("本地没有数据");
                this.fetchNetData(url, flag).then(data => {
                    resolve(this._wrapData(data));

                }).catch((error => {
                    reject(error);
                }))
            })
        })
    }

    //保存数据
    saveData(url, data, callback) {
        if (!data || !url) {
            return;
        } else {
            console.log(data);
            AsyncStorage.setItem(url, JSON.stringify(this._wrapData(data)), callback)
        }
    }

    /**
     * 从本地获取数据
     * @param url
     * @returns {Promise<any> | Promise}
     */
    fetchLocalData(url) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(url, (error, result) => {
                if (!error) {
                    try {
                        resolve(JSON.parse(result));
                    } catch (e) {
                        reject(e);
                        console.error(e);
                    }
                } else {
                    reject(error);
                    console.error(error);
                }
            })
        })
    }

    fetchNetData(url, flag) {
        return new Promise((resolve, reject) => {
            console.log("请求网络url："+url);
            if (flag === FLAG_STORAGE.flag_popular) {
                fetch(url)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Network response was not ok.');
                    })
                    .then((responseData) => {
                        this.saveData(url, responseData);
                        resolve(responseData);
                    })
                    .catch((error) => {
                        console.log("网络请求失败");
                        reject(error);
                    })
            } else {
                new GitHubTrending().fetchTrending(url)
                    .then(items => {
                        console.log("回调有数据")
                        if (!items) {
                            throw new Error("responseData is null");
                        }
                        this.saveData(url, items);
                        resolve(items);
                    })
                    .catch(error => {
                        console.log("回调错误")
                        console.log(error);
                        console.log("---------");
                        reject(error);
                    })
            }
        })
    }

    //要保存数据以及时间戳
    _wrapData(data) {
        return {
            data: data,
            timestamp: new Date().getTime()
        }
    }

    static checkTimestampValid(timestamp) {
        const currentDate = new Date();
        const targetDate = new Date(timestamp);
        //targetDate.setTime(timestamp);
        if (currentDate.getMonth() != targetDate.getMonth()) return false;
        if (currentDate.getDate() != targetDate.getDate()) return false;
        if (currentDate.getHours() - targetDate.getHours() > 4) return false;
        return true;
    }
}