# 考勤管理系统 RESTful API 接口文档

> **版本**：v1.0  
> **Base URL**：`http://localhost:8080/api`  
> **协议**：HTTP/HTTPS  
> **数据格式**：JSON（`Content-Type: application/json`）  
> **字符编码**：UTF-8  
> **认证方式**：JWT Bearer Token（`Authorization: Bearer <token>`）
>
> **文档说明**：
> - 前端页面与本接口文档初稿由 Lovable 生成
> - 后端代码实现、联调修复与代码审查由 Codex 完成

---

## 目录

1. [通用约定](#1-通用约定)
2. [认证模块 /auth](#2-认证模块)
3. [用户/员工模块 /employees](#3-员工模块)
4. [部门模块 /departments](#4-部门模块)
5. [考勤打卡模块 /attendance](#5-考勤打卡模块)
6. [审批/请假模块 /leave-requests](#6-审批请假模块)
7. [考勤规则模块 /attendance-rules](#7-考勤规则模块)
8. [假期类型模块 /leave-types](#8-假期类型模块)
9. [统计报表模块 /statistics](#9-统计报表模块)
10. [公司配置模块 /company-config](#10-公司配置模块)
11. [AI智能分析模块 /ai](#11-ai智能分析模块)
12. [数据库设计参考](#12-数据库设计参考)

---

## 1. 通用约定

### 1.1 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| `200` | OK | GET/PUT 成功 |
| `201` | Created | POST 创建成功 |
| `204` | No Content | DELETE 成功 |
| `400` | Bad Request | 请求参数错误 |
| `401` | Unauthorized | 未登录或 Token 过期 |
| `403` | Forbidden | 无权限（非管理员） |
| `404` | Not Found | 资源不存在 |
| `409` | Conflict | 资源冲突（如重复打卡） |
| `422` | Unprocessable Entity | 业务校验失败 |
| `500` | Internal Server Error | 服务器内部错误 |

### 1.2 统一响应格式

**成功响应：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

**分页响应：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [ ... ],
    "total": 200,
    "page": 1,
    "pageSize": 15,
    "totalPages": 14
  }
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    { "field": "username", "message": "用户名不能为空" }
  ]
}
```

### 1.3 通用查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `pageSize` | int | 15 | 每页条数（最大100） |
| `sortBy` | string | `createdAt` | 排序字段 |
| `sortOrder` | string | `desc` | 排序方向 `asc`/`desc` |

### 1.4 日期格式

- 日期：`yyyy-MM-dd`（如 `2026-03-08`）
- 时间：`HH:mm`（如 `09:00`）
- 日期时间：`yyyy-MM-dd'T'HH:mm:ss`（ISO 8601）

---

## 2. 认证模块

### 2.1 用户登录

```
POST /api/auth/login
```

**请求体：**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": "1",
      "username": "admin",
      "name": "张明远",
      "role": "admin",
      "department": "技术部",
      "position": "技术总监",
      "employeeId": "EMP001",
      "phone": "13800138001",
      "email": "zhangmy@company.com",
      "avatar": null,
      "joinDate": "2020-03-15"
    }
  }
}
```

**失败响应 (401)：**
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

### 2.2 获取当前用户信息

```
GET /api/auth/me
```

**请求头：** `Authorization: Bearer <token>`

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "1",
    "username": "admin",
    "name": "张明远",
    "role": "admin",
    "department": "技术部",
    "position": "技术总监",
    "employeeId": "EMP001",
    "phone": "13800138001",
    "email": "zhangmy@company.com",
    "avatar": null,
    "joinDate": "2020-03-15"
  }
}
```

### 2.3 修改密码

```
PUT /api/auth/password
```

**请求体：**
```json
{
  "oldPassword": "123456",
  "newPassword": "654321",
  "confirmPassword": "654321"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

**失败响应 (422)：**
```json
{
  "code": 422,
  "message": "原密码错误"
}
```

### 2.4 退出登录

```
POST /api/auth/logout
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

## 3. 员工模块

### 3.1 分页查询员工列表

```
GET /api/employees
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 页码，默认1 |
| `pageSize` | int | 否 | 每页条数，默认15 |
| `keyword` | string | 否 | 搜索关键词（姓名/工号/电话模糊匹配） |
| `department` | string | 否 | 部门名称筛选 |
| `role` | string | 否 | 角色筛选 `admin`/`employee` |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "1",
        "username": "admin",
        "name": "张明远",
        "role": "admin",
        "department": "技术部",
        "position": "技术总监",
        "employeeId": "EMP001",
        "phone": "13800138001",
        "email": "zhangmy@company.com",
        "avatar": null,
        "joinDate": "2020-03-15"
      }
    ],
    "total": 200,
    "page": 1,
    "pageSize": 15,
    "totalPages": 14
  }
}
```

### 3.2 根据ID查询员工详情

```
GET /api/employees/{id}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 员工ID |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "1",
    "username": "admin",
    "name": "张明远",
    "role": "admin",
    "department": "技术部",
    "position": "技术总监",
    "employeeId": "EMP001",
    "phone": "13800138001",
    "email": "zhangmy@company.com",
    "avatar": null,
    "joinDate": "2020-03-15"
  }
}
```

### 3.3 新增员工

```
POST /api/employees
```

**权限：** 仅管理员

**请求体：**
```json
{
  "username": "zhangsan",
  "password": "123456",
  "name": "张三",
  "role": "employee",
  "department": "技术部",
  "position": "前端工程师",
  "phone": "13912345678",
  "email": "zhangsan@company.com",
  "joinDate": "2026-03-01"
}
```

**成功响应 (201)：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "201",
    "username": "zhangsan",
    "name": "张三",
    "role": "employee",
    "department": "技术部",
    "position": "前端工程师",
    "employeeId": "EMP201",
    "phone": "13912345678",
    "email": "zhangsan@company.com",
    "avatar": null,
    "joinDate": "2026-03-01"
  }
}
```

### 3.4 修改员工信息

```
PUT /api/employees/{id}
```

**权限：** 管理员可改任何人，员工仅可改自己部分字段

**请求体（全量更新）：**
```json
{
  "name": "张三丰",
  "department": "产品部",
  "position": "产品经理",
  "phone": "13900001111",
  "email": "zhangsf@company.com",
  "role": "employee"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

### 3.5 删除员工

```
DELETE /api/employees/{id}
```

**权限：** 仅管理员

**成功响应 (204)：** 无响应体

**失败响应 (403)：**
```json
{
  "code": 403,
  "message": "无权限执行此操作"
}
```

---

## 4. 部门模块

### 4.1 查询所有部门（树形结构）

```
GET /api/departments
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tree` | boolean | 否 | 是否返回树形结构，默认`true` |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "1",
      "name": "技术部",
      "parentId": null,
      "manager": "张明远",
      "memberCount": 35,
      "children": [
        {
          "id": "9",
          "name": "前端组",
          "parentId": "1",
          "manager": "李思涵",
          "memberCount": 12,
          "children": []
        },
        {
          "id": "10",
          "name": "后端组",
          "parentId": "1",
          "manager": "赵雨萱",
          "memberCount": 10,
          "children": []
        }
      ]
    }
  ]
}
```

### 4.2 查询单个部门

```
GET /api/departments/{id}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "1",
    "name": "技术部",
    "parentId": null,
    "manager": "张明远",
    "memberCount": 35
  }
}
```

### 4.3 新增部门

```
POST /api/departments
```

**权限：** 仅管理员

**请求体：**
```json
{
  "name": "AI研发组",
  "parentId": "1",
  "manager": "王五"
}
```

**成功响应 (201)：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "14",
    "name": "AI研发组",
    "parentId": "1",
    "manager": "王五",
    "memberCount": 0
  }
}
```

### 4.4 修改部门

```
PUT /api/departments/{id}
```

**权限：** 仅管理员

**请求体：**
```json
{
  "name": "AI研发部",
  "parentId": null,
  "manager": "王五"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

### 4.5 删除部门

```
DELETE /api/departments/{id}
```

**权限：** 仅管理员（部门下无员工时才可删除）

**成功响应 (204)：** 无响应体

**失败响应 (422)：**
```json
{
  "code": 422,
  "message": "该部门下仍有员工，无法删除"
}
```

---

## 5. 考勤打卡模块

### 5.1 签到打卡

```
POST /api/attendance/clock-in
```

**请求体：**
```json
{
  "latitude": 29.5647,
  "longitude": 106.2965
}
```

**成功响应 (201)：**
```json
{
  "code": 201,
  "message": "签到成功",
  "data": {
    "id": "att-1-2026-03-08",
    "userId": "1",
    "date": "2026-03-08",
    "clockIn": "08:55",
    "clockOut": null,
    "status": "normal",
    "clockInLocation": {
      "latitude": 29.5647,
      "longitude": 106.2965
    },
    "clockOutLocation": null,
    "distance": 120,
    "isLate": false,
    "remark": null
  }
}
```

**失败响应 - 不在范围内 (422)：**
```json
{
  "code": 422,
  "message": "您不在打卡范围内",
  "data": {
    "distance": 46516,
    "maxDistance": 500,
    "companyName": "重庆人文科技学院"
  }
}
```

**失败响应 - 重复打卡 (409)：**
```json
{
  "code": 409,
  "message": "今日已签到，请勿重复打卡"
}
```

### 5.2 签退打卡

```
POST /api/attendance/clock-out
```

**请求体：**
```json
{
  "latitude": 29.5647,
  "longitude": 106.2965
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "签退成功",
  "data": {
    "id": "att-1-2026-03-08",
    "userId": "1",
    "date": "2026-03-08",
    "clockIn": "08:55",
    "clockOut": "18:05",
    "status": "normal",
    "clockInLocation": {
      "latitude": 29.5647,
      "longitude": 106.2965
    },
    "clockOutLocation": {
      "latitude": 29.5650,
      "longitude": 106.2960
    },
    "isEarly": false,
    "remark": null
  }
}
```

### 5.3 查询个人考勤记录

```
GET /api/attendance/my
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 页码 |
| `pageSize` | int | 否 | 每页条数 |
| `startDate` | string | 否 | 开始日期 `yyyy-MM-dd` |
| `endDate` | string | 否 | 结束日期 `yyyy-MM-dd` |
| `status` | string | 否 | 状态筛选 `normal`/`late`/`early`/`absent`/`leave` |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "att-1-2026-03-08",
        "userId": "1",
        "date": "2026-03-08",
        "clockIn": "08:55",
        "clockOut": "18:05",
        "status": "normal",
        "remark": null
      }
    ],
    "total": 22,
    "page": 1,
    "pageSize": 15,
    "totalPages": 2
  }
}
```

### 5.4 查询所有员工考勤记录（管理员）

```
GET /api/attendance
```

**权限：** 仅管理员

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 页码 |
| `pageSize` | int | 否 | 每页条数 |
| `userId` | string | 否 | 指定员工ID |
| `department` | string | 否 | 按部门筛选 |
| `startDate` | string | 否 | 开始日期 |
| `endDate` | string | 否 | 结束日期 |
| `status` | string | 否 | 状态筛选 |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "att-5-2026-03-08",
        "userId": "5",
        "userName": "王佳琪",
        "department": "市场部",
        "date": "2026-03-08",
        "clockIn": "09:22",
        "clockOut": "18:10",
        "status": "late",
        "remark": null
      }
    ],
    "total": 4200,
    "page": 1,
    "pageSize": 15,
    "totalPages": 280
  }
}
```

### 5.5 查询今日打卡状态

```
GET /api/attendance/today
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "hasClockedIn": true,
    "hasClockedOut": false,
    "clockInTime": "08:55",
    "clockOutTime": null,
    "status": "normal"
  }
}
```

---

## 6. 审批/请假模块

### 6.1 查询请假申请列表

```
GET /api/leave-requests
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 页码 |
| `pageSize` | int | 否 | 每页条数 |
| `status` | string | 否 | 状态 `pending`/`approved`/`rejected` |
| `type` | string | 否 | 类型 `annual`/`sick`/`personal`/`compensatory`/`overtime`/`business` |
| `userId` | string | 否 | 指定员工（管理员用） |

**说明：** 
- 普通员工只返回自己的申请
- 管理员返回所有人的申请

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "lr-1",
        "userId": "5",
        "userName": "王佳琪",
        "department": "市场部",
        "type": "annual",
        "typeName": "年假",
        "startDate": "2026-03-10",
        "endDate": "2026-03-12",
        "duration": 3,
        "reason": "回老家探亲",
        "status": "pending",
        "approverComment": null,
        "createdAt": "2026-03-07T10:30:00"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 15,
    "totalPages": 4
  }
}
```

### 6.2 查询单个请假详情

```
GET /api/leave-requests/{id}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "lr-1",
    "userId": "5",
    "userName": "王佳琪",
    "department": "市场部",
    "type": "annual",
    "typeName": "年假",
    "startDate": "2026-03-10",
    "endDate": "2026-03-12",
    "duration": 3,
    "reason": "回老家探亲",
    "status": "pending",
    "approverComment": null,
    "approverId": null,
    "approverName": null,
    "approvedAt": null,
    "createdAt": "2026-03-07T10:30:00"
  }
}
```

### 6.3 提交请假申请

```
POST /api/leave-requests
```

**请求体：**
```json
{
  "type": "annual",
  "startDate": "2026-03-10",
  "endDate": "2026-03-12",
  "reason": "回老家探亲"
}
```

**成功响应 (201)：**
```json
{
  "code": 201,
  "message": "申请提交成功",
  "data": {
    "id": "lr-51",
    "userId": "1",
    "userName": "张明远",
    "department": "技术部",
    "type": "annual",
    "typeName": "年假",
    "startDate": "2026-03-10",
    "endDate": "2026-03-12",
    "duration": 3,
    "reason": "回老家探亲",
    "status": "pending",
    "createdAt": "2026-03-08T10:00:00"
  }
}
```

**失败响应 (422)：**
```json
{
  "code": 422,
  "message": "年假余额不足，剩余2天，申请3天"
}
```

### 6.4 审批通过

```
PUT /api/leave-requests/{id}/approve
```

**权限：** 仅管理员

**请求体：**
```json
{
  "comment": "同意，注意工作交接"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "审批通过",
  "data": {
    "id": "lr-1",
    "status": "approved",
    "approverComment": "同意，注意工作交接",
    "approverId": "1",
    "approverName": "张明远",
    "approvedAt": "2026-03-08T11:00:00"
  }
}
```

### 6.5 审批驳回

```
PUT /api/leave-requests/{id}/reject
```

**权限：** 仅管理员

**请求体：**
```json
{
  "comment": "近期项目紧张，建议延期"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "已驳回",
  "data": {
    "id": "lr-1",
    "status": "rejected",
    "approverComment": "近期项目紧张，建议延期",
    "approverId": "1",
    "approverName": "张明远",
    "approvedAt": "2026-03-08T11:00:00"
  }
}
```

### 6.6 撤销请假申请

```
DELETE /api/leave-requests/{id}
```

**说明：** 仅可撤销自己的 `pending` 状态申请

**成功响应 (204)：** 无响应体

**失败响应 (422)：**
```json
{
  "code": 422,
  "message": "已审批的申请无法撤销"
}
```

---

## 7. 考勤规则模块

### 7.1 查询所有考勤规则

```
GET /api/attendance-rules
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "1",
      "name": "标准班次",
      "clockInTime": "09:00",
      "clockOutTime": "18:00",
      "lateThreshold": 15,
      "earlyThreshold": 15,
      "isDefault": true
    },
    {
      "id": "2",
      "name": "弹性班次",
      "clockInTime": "10:00",
      "clockOutTime": "19:00",
      "lateThreshold": 30,
      "earlyThreshold": 30,
      "isDefault": false
    },
    {
      "id": "3",
      "name": "早班",
      "clockInTime": "07:00",
      "clockOutTime": "16:00",
      "lateThreshold": 10,
      "earlyThreshold": 10,
      "isDefault": false
    }
  ]
}
```

### 7.2 新增考勤规则

```
POST /api/attendance-rules
```

**权限：** 仅管理员

**请求体：**
```json
{
  "name": "夜班",
  "clockInTime": "22:00",
  "clockOutTime": "06:00",
  "lateThreshold": 15,
  "earlyThreshold": 15,
  "isDefault": false
}
```

**成功响应 (201)：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "4",
    "name": "夜班",
    "clockInTime": "22:00",
    "clockOutTime": "06:00",
    "lateThreshold": 15,
    "earlyThreshold": 15,
    "isDefault": false
  }
}
```

### 7.3 修改考勤规则

```
PUT /api/attendance-rules/{id}
```

**权限：** 仅管理员

**请求体：**
```json
{
  "name": "标准班次",
  "clockInTime": "08:30",
  "clockOutTime": "17:30",
  "lateThreshold": 10,
  "earlyThreshold": 10,
  "isDefault": true
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

### 7.4 删除考勤规则

```
DELETE /api/attendance-rules/{id}
```

**权限：** 仅管理员（默认规则不可删除）

**成功响应 (204)：** 无响应体

**失败响应 (422)：**
```json
{
  "code": 422,
  "message": "默认考勤规则不可删除"
}
```

---

## 8. 假期类型模块

### 8.1 查询所有假期类型

```
GET /api/leave-types
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    { "id": "1", "name": "年假", "maxDays": 15, "requireApproval": true },
    { "id": "2", "name": "事假", "maxDays": 10, "requireApproval": true },
    { "id": "3", "name": "病假", "maxDays": 30, "requireApproval": true },
    { "id": "4", "name": "调休", "maxDays": 5, "requireApproval": true },
    { "id": "5", "name": "婚假", "maxDays": 10, "requireApproval": true },
    { "id": "6", "name": "产假", "maxDays": 90, "requireApproval": true },
    { "id": "7", "name": "丧假", "maxDays": 3, "requireApproval": true }
  ]
}
```

### 8.2 新增假期类型

```
POST /api/leave-types
```

**权限：** 仅管理员

**请求体：**
```json
{
  "name": "陪产假",
  "maxDays": 15,
  "requireApproval": true
}
```

**成功响应 (201)**

### 8.3 修改假期类型

```
PUT /api/leave-types/{id}
```

**权限：** 仅管理员

### 8.4 删除假期类型

```
DELETE /api/leave-types/{id}
```

**权限：** 仅管理员

---

## 9. 统计报表模块

### 9.1 个人月度统计

```
GET /api/statistics/personal
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | string | 否 | 员工ID（管理员可查他人，默认当前用户） |
| `year` | int | 否 | 年份，默认当年 |
| `month` | int | 否 | 月份（1-12），默认当月 |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "userId": "1",
    "userName": "张明远",
    "year": 2026,
    "month": 3,
    "totalDays": 22,
    "normalDays": 18,
    "lateDays": 2,
    "earlyDays": 0,
    "absentDays": 1,
    "leaveDays": 1,
    "overtimeHours": 3.5,
    "attendanceRate": 95.5
  }
}
```

### 9.2 部门统计（管理员）

```
GET /api/statistics/departments
```

**权限：** 仅管理员

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | string | 否 | 指定日期，默认今天 |

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "department": "技术部",
      "total": 35,
      "present": 33,
      "late": 1,
      "absent": 2,
      "rate": 94.3
    },
    {
      "department": "市场部",
      "total": 25,
      "present": 22,
      "late": 2,
      "absent": 3,
      "rate": 88.0
    }
  ]
}
```

### 9.3 仪表盘概览数据

```
GET /api/statistics/dashboard
```

**说明：** 根据角色返回不同数据

**管理员响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "todayPresent": 185,
    "todayAbsent": 15,
    "todayLate": 8,
    "pendingApprovals": 12,
    "totalEmployees": 200,
    "monthlyAttendanceRate": 94.2,
    "recentAnomalies": [
      {
        "userId": "15",
        "userName": "刘志豪",
        "department": "运营部",
        "type": "late",
        "date": "2026-03-08",
        "detail": "迟到23分钟"
      }
    ]
  }
}
```

**员工响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "todayClockedIn": true,
    "todayClockedOut": false,
    "todayClockInTime": "08:55",
    "monthNormalDays": 18,
    "monthLateDays": 2,
    "monthEarlyDays": 0,
    "pendingRequests": 1
  }
}
```

### 9.4 导出考勤报表

```
GET /api/statistics/export
```

**权限：** 仅管理员

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `year` | int | 是 | 年份 |
| `month` | int | 是 | 月份 |
| `department` | string | 否 | 部门筛选 |
| `format` | string | 否 | 导出格式 `xlsx`/`csv`，默认`xlsx` |

**成功响应 (200)：** 返回文件流

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="attendance_2026_03.xlsx"
```

---

## 10. 公司配置模块

### 10.1 获取公司打卡位置配置

```
GET /api/company-config/location
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "latitude": 29.5647,
    "longitude": 106.2965,
    "name": "重庆人文科技学院",
    "radius": 500,
    "updatedAt": "2026-03-08T10:00:00",
    "updatedBy": "张明远"
  }
}
```

### 10.2 修改公司打卡位置配置

```
PUT /api/company-config/location
```

**权限：** 仅管理员

**请求体：**
```json
{
  "latitude": 29.5647,
  "longitude": 106.2965,
  "name": "重庆人文科技学院",
  "radius": 500
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "公司位置已更新",
  "data": {
    "latitude": 29.5647,
    "longitude": 106.2965,
    "name": "重庆人文科技学院",
    "radius": 500,
    "updatedAt": "2026-03-08T15:30:00",
    "updatedBy": "张明远"
  }
}
```

---

## 11. AI智能分析模块

> **说明：** 此模块需集成 Spring AI 框架，调用大模型进行智能分析

### 11.1 AI对话（考勤助手）

```
POST /api/ai/chat
```

**请求体：**
```json
{
  "messages": [
    { "role": "user", "content": "我这个月迟到几次？" }
  ]
}
```

**说明：**
- `messages` 数组包含完整的对话历史（前端维护）
- 后端需结合当前登录用户的考勤数据 + Spring AI 生成回复
- 建议在 System Prompt 中注入用户考勤数据作为上下文

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": "根据系统记录，您本月迟到 **2次**，分别是3月3日（迟到8分钟）和3月5日（迟到3分钟）。\n\n建议您提前出发，避免交通高峰。",
    "role": "assistant"
  }
}
```

**Spring AI 实现建议：**
```java
@PostMapping("/chat")
public R<ChatResponse> chat(@RequestBody ChatRequest request) {
    // 1. 获取当前用户ID
    String userId = SecurityUtils.getCurrentUserId();
    
    // 2. 查询该用户的考勤数据
    AttendanceStats stats = attendanceService.getMonthlyStats(userId);
    List<AttendanceRecord> records = attendanceService.getRecentRecords(userId);
    
    // 3. 构建 System Prompt，注入考勤数据
    String systemPrompt = String.format("""
        你是一个考勤助手AI。以下是当前用户的考勤数据：
        - 用户姓名：%s
        - 本月出勤：%d天
        - 迟到：%d次
        - 早退：%d次
        - 请假：%d天
        - 近期记录：%s
        请根据以上数据回答用户的问题。使用 Markdown 格式回复。
        """, user.getName(), stats.getNormalDays(), stats.getLateDays(), 
        stats.getEarlyDays(), stats.getLeaveDays(), records.toString());
    
    // 4. 调用 Spring AI ChatClient
    String response = chatClient.prompt()
        .system(systemPrompt)
        .messages(request.getMessages())
        .call()
        .content();
    
    return R.ok(new ChatResponse(response, "assistant"));
}
```

### 11.2 考勤报表AI摘要

```
POST /api/ai/summary
```

**请求体：**
```json
{
  "type": "personal",
  "userId": "1",
  "data": {
    "totalDays": 22,
    "normalDays": 18,
    "lateDays": 2,
    "earlyDays": 0,
    "absentDays": 1,
    "leaveDays": 1
  }
}
```

**说明：**
- `type` 可选 `personal`（个人）或 `department`（部门）
- `personal` 时传 `userId` 和个人统计数据
- `department` 时传部门统计数据数组

**部门维度请求体：**
```json
{
  "type": "department",
  "data": [
    { "department": "技术部", "total": 35, "present": 33, "late": 1, "absent": 2, "rate": 94.3 },
    { "department": "市场部", "total": 25, "present": 22, "late": 2, "absent": 3, "rate": 88.0 }
  ]
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": "## 📊 个人考勤月度分析\n\n### 整体评估\n本月您的出勤表现 **良好**...",
    "summary": "出勤率95.5%，迟到2次，整体表现良好",
    "generatedAt": "2026-03-08T15:30:00"
  }
}
```

**Spring AI 实现建议：**
```java
@PostMapping("/summary")
public R<SummaryResponse> summary(@RequestBody SummaryRequest request) {
    String prompt;
    if ("personal".equals(request.getType())) {
        prompt = String.format("""
            请根据以下员工考勤数据生成一份月度分析报告，使用 Markdown 格式：
            - 出勤天数：%d
            - 迟到次数：%d
            - 早退次数：%d
            - 缺勤天数：%d
            - 请假天数：%d
            
            要求：包含整体评估、数据亮点、AI建议三个板块。语气专业友好。
            """, data.getNormalDays(), data.getLateDays(), 
            data.getEarlyDays(), data.getAbsentDays(), data.getLeaveDays());
    } else {
        prompt = "请根据以下各部门考勤数据生成分析报告..." + request.getData().toString();
    }
    
    String content = chatClient.prompt()
        .user(prompt)
        .call()
        .content();
    
    return R.ok(new SummaryResponse(content));
}
```

---

## 12. 数据库设计参考

### 12.1 ER图（核心表）

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   employees  │     │   departments    │     │ attendance_records│
├──────────────┤     ├──────────────────┤     ├───────────────────┤
│ id (PK)      │     │ id (PK)          │     │ id (PK)           │
│ username     │──┐  │ name             │     │ user_id (FK)      │
│ password     │  │  │ parent_id (FK)   │     │ date              │
│ name         │  │  │ manager          │     │ clock_in          │
│ role         │  │  │ member_count     │     │ clock_out         │
│ dept_id (FK) │──┘  │ created_at       │     │ status            │
│ position     │     │ updated_at       │     │ clock_in_lat      │
│ employee_id  │     └──────────────────┘     │ clock_in_lng      │
│ phone        │                               │ clock_out_lat     │
│ email        │     ┌──────────────────┐     │ clock_out_lng     │
│ avatar       │     │  leave_requests  │     │ remark            │
│ join_date    │     ├──────────────────┤     │ created_at        │
│ created_at   │     │ id (PK)          │     └───────────────────┘
│ updated_at   │     │ user_id (FK)     │
└──────────────┘     │ type             │     ┌───────────────────┐
                     │ start_date       │     │ attendance_rules  │
                     │ end_date         │     ├───────────────────┤
                     │ reason           │     │ id (PK)           │
                     │ status           │     │ name              │
                     │ approver_id (FK) │     │ clock_in_time     │
                     │ approver_comment │     │ clock_out_time    │
                     │ approved_at      │     │ late_threshold    │
                     │ created_at       │     │ early_threshold   │
                     └──────────────────┘     │ is_default        │
                                              └───────────────────┘
┌──────────────────┐
│  leave_types     │     ┌──────────────────┐
├──────────────────┤     │  company_config  │
│ id (PK)          │     ├──────────────────┤
│ name             │     │ id (PK)          │
│ max_days         │     │ config_key       │
│ require_approval │     │ config_value     │
│ created_at       │     │ updated_by       │
└──────────────────┘     │ updated_at       │
                         └──────────────────┘
```

### 12.2 建表SQL参考

```sql
-- 部门表
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT NULL REFERENCES departments(id),
    manager VARCHAR(50),
    member_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 员工表
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    dept_id BIGINT REFERENCES departments(id),
    position VARCHAR(50),
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    avatar VARCHAR(255),
    join_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 考勤记录表
CREATE TABLE attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    status ENUM('normal', 'late', 'early', 'absent', 'leave') DEFAULT 'normal',
    clock_in_lat DECIMAL(10, 6),
    clock_in_lng DECIMAL(10, 6),
    clock_out_lat DECIMAL(10, 6),
    clock_out_lng DECIMAL(10, 6),
    remark VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, date)
);

-- 请假申请表
CREATE TABLE leave_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL REFERENCES employees(id),
    type ENUM('annual', 'sick', 'personal', 'compensatory', 'overtime', 'business') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approver_id BIGINT REFERENCES employees(id),
    approver_comment VARCHAR(255),
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 考勤规则表
CREATE TABLE attendance_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    clock_in_time TIME NOT NULL,
    clock_out_time TIME NOT NULL,
    late_threshold INT DEFAULT 15 COMMENT '迟到容忍分钟数',
    early_threshold INT DEFAULT 15 COMMENT '早退容忍分钟数',
    is_default TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 假期类型表
CREATE TABLE leave_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    max_days INT NOT NULL,
    require_approval TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 公司配置表
CREATE TABLE company_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    updated_by BIGINT REFERENCES employees(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初始数据
INSERT INTO company_config (config_key, config_value) VALUES 
('location', '{"latitude":29.5647,"longitude":106.2965,"name":"重庆人文科技学院","radius":500}');
```

---

## 附录：接口总览

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录 | 公开 |
| GET | `/api/auth/me` | 当前用户 | 登录 |
| PUT | `/api/auth/password` | 修改密码 | 登录 |
| POST | `/api/auth/logout` | 退出 | 登录 |
| GET | `/api/employees` | 员工列表 | 管理员 |
| GET | `/api/employees/{id}` | 员工详情 | 登录 |
| POST | `/api/employees` | 新增员工 | 管理员 |
| PUT | `/api/employees/{id}` | 修改员工 | 登录* |
| DELETE | `/api/employees/{id}` | 删除员工 | 管理员 |
| GET | `/api/departments` | 部门列表 | 登录 |
| GET | `/api/departments/{id}` | 部门详情 | 登录 |
| POST | `/api/departments` | 新增部门 | 管理员 |
| PUT | `/api/departments/{id}` | 修改部门 | 管理员 |
| DELETE | `/api/departments/{id}` | 删除部门 | 管理员 |
| POST | `/api/attendance/clock-in` | 签到 | 登录 |
| POST | `/api/attendance/clock-out` | 签退 | 登录 |
| GET | `/api/attendance/my` | 我的考勤 | 登录 |
| GET | `/api/attendance` | 全部考勤 | 管理员 |
| GET | `/api/attendance/today` | 今日状态 | 登录 |
| GET | `/api/leave-requests` | 请假列表 | 登录 |
| GET | `/api/leave-requests/{id}` | 请假详情 | 登录 |
| POST | `/api/leave-requests` | 提交请假 | 登录 |
| PUT | `/api/leave-requests/{id}/approve` | 审批通过 | 管理员 |
| PUT | `/api/leave-requests/{id}/reject` | 审批驳回 | 管理员 |
| DELETE | `/api/leave-requests/{id}` | 撤销申请 | 登录 |
| GET | `/api/attendance-rules` | 规则列表 | 登录 |
| POST | `/api/attendance-rules` | 新增规则 | 管理员 |
| PUT | `/api/attendance-rules/{id}` | 修改规则 | 管理员 |
| DELETE | `/api/attendance-rules/{id}` | 删除规则 | 管理员 |
| GET | `/api/leave-types` | 假期类型 | 登录 |
| POST | `/api/leave-types` | 新增类型 | 管理员 |
| PUT | `/api/leave-types/{id}` | 修改类型 | 管理员 |
| DELETE | `/api/leave-types/{id}` | 删除类型 | 管理员 |
| GET | `/api/statistics/personal` | 个人统计 | 登录 |
| GET | `/api/statistics/departments` | 部门统计 | 管理员 |
| GET | `/api/statistics/dashboard` | 仪表盘 | 登录 |
| GET | `/api/statistics/export` | 导出报表 | 管理员 |
| GET | `/api/company-config/location` | 公司位置 | 登录 |
| PUT | `/api/company-config/location` | 修改位置 | 管理员 |
| POST | `/api/ai/chat` | AI对话 | 登录 |
| POST | `/api/ai/summary` | AI摘要 | 登录 |

> **登录*** = 管理员可操作所有，员工仅限自己
