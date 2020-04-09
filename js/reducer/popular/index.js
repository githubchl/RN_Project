import Types from "../../action/types"

const defaultState = {};

/**
 * popular列表的数据结构
 * popular:{
 *      java:{
 *          items:[],
 *          isLoading:false
 *      },
 *      ios:{
 *          items:[],
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
        case Types.LOAD_POPULAR_SUCCESS://下拉刷新成功
            return {
                ...state,
                [action.storeName]:{
                    ...state[action.storeName],
                    items:action.items,//原始数据
                    projectModes:action.projectModes,//此次要展示的数据
                    isLoading:false,
                    hideLoadingMore:false,//是否隐藏底部加载更多
                    pageIndex:action.pageIndex
                }
            };
        case Types.POPULAR_REFRESH:
        return {
            ...state,
            [action.storeName]:{
                ...state[action.storeName],
                isLoading:true,
                hideLoadingMore:true,
            }
        };
        case Types.LOAD_POPULAR_FAIL://下拉刷新失败
            return {
                ...state,
                [action.storeName]:{
                    ...state[action.storeName],
                    isLoading:false,
                }
            };
        case Types.POPULAR_LOAD_MORE_SUCCESS://上拉加载更多成功
            return {
                ...state,
                [action.storeName]:{
                    ...state[action.storeName],
                    projectModes:action.projectModes,
                    hideLoadingMore:action.hideLoadingMore,//是否隐藏底部加载更多
                    pageIndex:action.pageIndex
                }
            };
        case Types.POPULAR_LOAD_MORE_FAIL://上拉加载更多失败
            return {
                ...state,
                [action.storeName]:{
                    ...state[action.storeName],
                    hideLoadingMore:true,//是否隐藏底部加载更多
                    pageIndex:action.pageIndex
                }
            };
        case Types.POPULAR_FLUSH_FAVORITE:
            return {
                ...state,
                [action.storeName]:{
                    ...state[action.storeName],
                    projectModes:action.projectModes,
                    isLoading:false,
                }
            };
        default:
            return state;
    }
}