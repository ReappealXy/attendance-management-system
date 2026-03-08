# 考勤管理系统后端

这是考勤管理系统的后端项目，基于 `Spring Boot 3 + Spring Security + MyBatis-Plus + MySQL + Spring AI` 构建，提供认证、打卡、审批、部门、员工、统计报表与 AI 分析接口。

## 项目说明

- 后端代码实现、问题修复、联调支持与代码审查由 Codex 完成
- 前端页面与接口文档初稿由 Lovable 生成，后端实现以当前代码与联调结果为准

## 本地运行

```bash
mvn spring-boot:run
```

或者：

```bash
mvn -DskipTests package
java -jar target/development-hub-backend-*.jar
```

## 必要环境变量

上传 GitHub 前已移除默认敏感信息，以下配置请通过环境变量或外部配置文件提供：

```bash
DB_URL=jdbc:mysql://localhost:3306/attendance_system?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=replace-with-a-secure-secret
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
SEED_SUPER_ADMIN_PASSWORD=your_init_admin_password
SEED_COMMON_USER_PASSWORD=your_init_user_password
```

如果未配置种子账号密码且数据库脚本中仍包含占位符，系统会在首次启动时自动生成初始化密码并打印到后端日志，随后请立即重置。

## 核心模块

- `controller/` REST 接口入口
- `service/` 业务逻辑
- `mapper/` MyBatis-Plus 数据访问
- `security/` JWT 与鉴权逻辑
- `config/` 启动修复、MyBatis 插件与系统配置
- `model/` 请求体、响应体、实体类

## AI 日志说明

AI 调用会在后端日志中打印明确来源：

- `AI chat succeeded via Spring AI...`
- `AI summary succeeded via Spring AI...`
- `fallback` / `disabled`

只要看到 `succeeded via Spring AI`，即可确认本次请求真正调用了大模型，而不是本地兜底逻辑。
