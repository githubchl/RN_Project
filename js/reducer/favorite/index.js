import Types from "../../action/types"

const defaultState = {};

/**
 * favorite列表的数据结构
 * favorite:{
 *      popular:{
 *          projectModels:[],
 *          isLoading:false
 *      },
 *      trending:{
 *          projectModels:[],
 *          isLoading:false
 *      }
 * }
 */

/**
 *
 * @param state
 * @param action
 * @returns {{theme: *}}
 */
export default function onAction(state = defaultState, action) {
    switch (action.type) {
        case Types.FAVORITE_LOAD_DATA://获取收藏数据
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: action.isLoading,
                }
            };
        case Types.FAVORITE_LOAD_SUCCESS:
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    projectModels: action.projectModels,
                    isLoading: false,
                }
            };
        case Types.FAVORITE_LOAD_FAIL://下拉刷新失败
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: false,
                }
            };
        default:
            return state;
    }
}