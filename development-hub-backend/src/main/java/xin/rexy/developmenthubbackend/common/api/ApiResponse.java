package xin.rexy.developmenthubbackend.common.api;

import java.util.List;

public record ApiResponse<T>(
        int code,
        String message,
        T data,
        List<FieldValidationError> errors
) {

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(200, message, data, null);
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(201, message, data, null);
    }

    public static ApiResponse<Void> ok(String message) {
        return new ApiResponse<>(200, message, null, null);
    }

    public static <T> ApiResponse<T> fail(int code, String message, T data, List<FieldValidationError> errors) {
        return new ApiResponse<>(code, message, data, errors);
    }
}
