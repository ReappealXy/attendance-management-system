package xin.rexy.developmenthubbackend.common.exception;

import java.util.List;
import org.springframework.http.HttpStatus;
import xin.rexy.developmenthubbackend.common.api.FieldValidationError;

public class BusinessException extends RuntimeException {

    private final int code;
    private final HttpStatus status;
    private final Object data;
    private final List<FieldValidationError> errors;

    public BusinessException(HttpStatus status, int code, String message) {
        this(status, code, message, null, null);
    }

    public BusinessException(HttpStatus status, int code, String message, Object data) {
        this(status, code, message, data, null);
    }

    public BusinessException(
            HttpStatus status,
            int code,
            String message,
            Object data,
            List<FieldValidationError> errors
    ) {
        super(message);
        this.code = code;
        this.status = status;
        this.data = data;
        this.errors = errors;
    }

    public int getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Object getData() {
        return data;
    }

    public List<FieldValidationError> getErrors() {
        return errors;
    }
}
