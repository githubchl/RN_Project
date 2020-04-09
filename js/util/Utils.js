export default class Utils {

    /**
     * 检查该item是否被收藏
     * @param item
     * @param items
     * @returns {boolean}
     */
    static checkFavorite(item, keys = []) {
        // console.log(JSON.stringify(item));
        // console.log(JSON.stringify(keys));
        if (!keys) return false;
        for (let i = 0, len = keys.length; i < len; i++) {
            let id = item.id ? item.id : item.fullName;
            if (id.toString()===keys[i]){
                return true
            }
        }
        return false;
    }

}