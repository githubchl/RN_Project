import {onThemeChange,onThemeInit,onShowCustomThemeView} from "./theme/index"
import {onLoadPopularData,onLoadMorePopular,onFlushPopularFavorite} from "./popular/index"
import {onLoadMoreTrending,onRefreshTrending,onFlushPopularTrending} from "./trending/index"
import {onLoadFavoriteData} from "./favorite/index"
import {onLoadLanguage} from "./language/index"

export default {
    onThemeInit,
    onThemeChange,
    onShowCustomThemeView,

    onLoadPopularData,
    onLoadMorePopular,
    onFlushPopularFavorite,

    onRefreshTrending,
    onLoadMoreTrending,
    onFlushPopularTrending,

    onLoadFavoriteData,

    onLoadLanguage,
}