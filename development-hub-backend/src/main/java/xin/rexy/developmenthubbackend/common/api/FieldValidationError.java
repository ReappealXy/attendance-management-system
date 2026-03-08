package xin.rexy.developmenthubbackend.common.api;

public record FieldValidationError(
        String field,
        String message
) {
}
