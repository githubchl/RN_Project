export default class ArrayUtil {

    /**
     * 更新数组，如果元素存在则移除，不存在则添加
     * @param array
     * @param item
     */
    static updateArray(array, item) {
        for (let i = 0, len = array.length; i < len; i++) {
            let temp = array[i];
            if (item === temp) {
                array.splice(i, 1);
                return;
            }
        }
        array.push(item);
    }

    /**
     *将数组中指定元素移除
     * @param array
     * @param item 要移除的item
     * @param id 要对比的属性，缺省则比较地址
     */
    static remove(array, item, id) {
        if (!array) return;
        for (let i = 0, j = array.length; i < j; i++) {
            const val = array[i];
            if (item === val || val && val[id] && val[id]===item[id]){
                array.splice(i,1);
            }
        }
        return array;
    }

    /**
     * 判断两个数组是否相等
     */

    static isEqual(arr1, arr2) {
        if (!(arr1 && arr2)) return false;
        if (arr1.length !== arr2.length) return false;
        for (let i = 0, j = arr1.length; i < j; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }


    /**
     * clone数组，返回一个新数组
     * @param from
     */
    static clone(from){
        if (!from) return [];
        let newArray = [];
        for (let i = 0; i <from.length; i++) {
            newArray [i] = from[i];
        }
        return newArray;
    }

}