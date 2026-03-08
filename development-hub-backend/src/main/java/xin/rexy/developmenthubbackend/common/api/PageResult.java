package xin.rexy.developmenthubbackend.common.api;

import com.github.pagehelper.PageInfo;
import java.util.List;

public record PageResult<T>(
        List<T> records,
        long total,
        long page,
        long pageSize,
        long totalPages
) {

    public static <T> PageResult<T> from(PageInfo<T> page) {
        return new PageResult<>(
                page.getList(),
                page.getTotal(),
                page.getPageNum(),
                page.getPageSize(),
                page.getPages()
        );
    }
}
