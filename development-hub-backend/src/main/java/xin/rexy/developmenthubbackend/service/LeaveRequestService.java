package xin.rexy.developmenthubbackend.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.api.PageResult;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.LeaveRequestMapper;
import xin.rexy.developmenthubbackend.model.entity.LeaveRequestEntity;
import xin.rexy.developmenthubbackend.model.request.LeaveCreateRequest;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class LeaveRequestService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "annual", "sick", "personal", "compensatory", "overtime", "business"
    );

    private final LeaveRequestMapper leaveRequestMapper;

    public LeaveRequestService(LeaveRequestMapper leaveRequestMapper) {
        this.leaveRequestMapper = leaveRequestMapper;
    }

    public PageResult<LeaveRequestEntity> list(long page, long pageSize, String status, String type, Long userId) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        PageHelper.startPage(Math.toIntExact(page), Math.toIntExact(pageSize));
        List<LeaveRequestEntity> records = leaveRequestMapper.selectLeavePage(
                currentUser.id(),
                currentUser.isAdmin(),
                status,
                type,
                userId
        );
        records.forEach(this::fillComputedFields);
        return PageResult.from(new PageInfo<>(records));
    }

    public LeaveRequestEntity getById(Long id) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        LeaveRequestEntity leaveRequest = leaveRequestMapper.selectLeaveById(id);
        if (leaveRequest == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "请假申请不存在");
        }
        if (!currentUser.isAdmin() && !currentUser.id().equals(leaveRequest.getUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        fillComputedFields(leaveRequest);
        return leaveRequest;
    }

    @Transactional
    public LeaveRequestEntity create(LeaveCreateRequest request) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "结束日期不能早于开始日期");
        }
        if (!ALLOWED_TYPES.contains(request.type())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "请假类型不合法");
        }
        LeaveRequestEntity entity = new LeaveRequestEntity();
        entity.setUserId(currentUser.id());
        entity.setType(request.type());
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setReason(request.reason());
        entity.setStatus("pending");
        leaveRequestMapper.insert(entity);
        LeaveRequestEntity saved = leaveRequestMapper.selectLeaveById(entity.getId());
        fillComputedFields(saved);
        return saved;
    }

    @Transactional
    public LeaveRequestEntity approve(Long id, String comment) {
        return handleApproval(id, "approved", comment == null || comment.isBlank() ? "同意" : comment);
    }

    @Transactional
    public LeaveRequestEntity reject(Long id, String comment) {
        return handleApproval(id, "rejected", comment == null || comment.isBlank() ? "不符合条件，建议延期" : comment);
    }

    @Transactional
    public void cancel(Long id) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        LeaveRequestEntity leaveRequest = leaveRequestMapper.selectLeaveById(id);
        if (leaveRequest == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "请假申请不存在");
        }
        if (!currentUser.id().equals(leaveRequest.getUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        if (!"pending".equals(leaveRequest.getStatus())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "已审批的申请无法撤销");
        }
        leaveRequestMapper.softDeleteById(id, LocalDateTime.now());
    }

    public long countPendingByCurrentUser() {
        return leaveRequestMapper.countPendingByUserId(SecurityUtils.currentUser().id());
    }

    public long countPendingAll() {
        return leaveRequestMapper.countPendingAll();
    }

    private LeaveRequestEntity handleApproval(Long id, String targetStatus, String comment) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        LeaveRequestEntity leaveRequest = leaveRequestMapper.selectLeaveById(id);
        if (leaveRequest == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "请假申请不存在");
        }
        if (!"pending".equals(leaveRequest.getStatus())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "该申请已处理");
        }
        leaveRequest.setStatus(targetStatus);
        leaveRequest.setApproverId(currentUser.id());
        leaveRequest.setApproverComment(comment);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        leaveRequestMapper.updateById(leaveRequest);
        LeaveRequestEntity updated = leaveRequestMapper.selectLeaveById(id);
        fillComputedFields(updated);
        return updated;
    }

    private void fillComputedFields(LeaveRequestEntity entity) {
        if (entity == null) {
            return;
        }
        entity.setDuration((int) ChronoUnit.DAYS.between(entity.getStartDate(), entity.getEndDate()) + 1);
        entity.setTypeName(typeLabel(entity.getType()));
    }

    private String typeLabel(String type) {
        return Map.of(
                "annual", "年假",
                "sick", "病假",
                "personal", "事假",
                "compensatory", "调休",
                "overtime", "加班",
                "business", "出差"
        ).getOrDefault(type, type);
    }
}
