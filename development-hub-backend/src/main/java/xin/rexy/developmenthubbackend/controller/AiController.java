package xin.rexy.developmenthubbackend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.model.request.AiChatRequest;
import xin.rexy.developmenthubbackend.model.request.AiSummaryRequest;
import xin.rexy.developmenthubbackend.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ApiResponse<?> chat(@Valid @RequestBody AiChatRequest request) {
        return ApiResponse.ok("success", aiService.chat(request.messages()));
    }

    @PostMapping("/summary")
    public ApiResponse<?> summary(@Valid @RequestBody AiSummaryRequest request) {
        return ApiResponse.ok("success", aiService.summary(request.type(), request.userId(), request.data()));
    }
}
