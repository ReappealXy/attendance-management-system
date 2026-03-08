# 毕业设计：基于 React 与 Spring Boot 的考勤管理系统

> Attendance Management System  
> Graduation Project / Full Stack Project

这是一个用于毕业设计展示与完整联调的前后端一体化考勤管理系统，包含员工端与管理员端两类使用场景，支持登录认证、考勤打卡、请假审批、员工与部门管理、考勤规则配置、统计报表导出以及 Spring AI 智能分析能力。

本目录适合作为一个新的 GitHub 总仓库使用，统一管理前端与后端代码。

## 项目简介

本系统围绕“企业日常考勤管理”这一实际业务场景设计，目标是实现一个具备完整业务闭环的全栈项目：

- 员工可以登录系统，完成上下班打卡、查看考勤记录、提交请假申请、查看审批状态和个人统计数据
- 管理员可以查看全局工作台、处理待审批申请、维护员工与部门、配置考勤规则、查看统计报表
- 系统接入 Spring AI，用于 AI 聊天问答和报表摘要分析

从功能定位上看，这不是单纯的页面展示项目，而是一个包含前端界面、后端 API、数据库初始化脚本、权限控制、AI 集成与部署准备的完整毕业设计项目。

## 项目结构

```text
FuckGraduationProject/
  README.md                         根目录总说明文档
  .gitignore                        根目录统一忽略规则
  ai-assisted-development-hub/      前端项目（React + Vite）
    README.md                       前端说明文档
    API-DOCUMENTATION.md            接口文档
    database.sql                    数据库初始化脚本
    public/
      favicon.svg                   前端站点图标
      placeholder.svg               前端占位图资源
    src/                            前端源码
  development-hub-backend/          后端项目（Spring Boot）
    README.md                       后端说明文档
    pom.xml                         Maven 配置
    src/main/java/                  后端源码
    src/main/resources/             配置文件与 Mapper XML
```

## 功能模块

### 员工端功能

- 用户登录与获取当前用户信息
- 考勤打卡、签到签退状态查看
- 个人考勤记录查询
- 发起请假 / 调休 / 出差 / 加班申请
- 查看个人审批状态
- 查看个人月度统计报表
- 使用 AI 助手查询个人考勤情况

### 管理端功能

- 管理工作台总览
- 待审批事项查看与审批处理
- 员工新增、编辑、删除、重置密码
- 部门管理
- 考勤规则管理
- 统计报表查看与导出
- AI 智能分析

### 系统能力

- JWT 鉴权
- 基于角色的权限控制
- MyBatis-Plus 数据访问
- MySQL 数据初始化脚本
- Spring AI 集成
- 前后端分离部署

## 技术栈

### 前端

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

### 后端

- Spring Boot 3
- Spring Security
- MyBatis-Plus
- PageHelper
- MySQL
- JWT
- Spring AI

## 开发说明

### 前端来源

- 前端页面原型、基础界面与部分接口文档初稿由 Lovable 生成

### 后端来源

- 后端代码实现、联调修复、功能补全、日志增强与代码审查由 Codex 完成

这部分建议你保留在仓库中，老师或面试官看到后会更容易理解项目的开发方式与协作背景。

## 本地运行

### 1. 初始化数据库

数据库脚本位于：

```text
ai-assisted-development-hub/database.sql
```

默认演示账号：

- 超级管理员：`super_admin / ChangeMe123!`
- 管理员：`admin_zhang / 123456`
- 普通员工：`user006 ~ user400 / 123456`

说明：

- 这些账号仅用于演示、测试和联调
- 上传公开仓库前，已经将示例账号改为通用演示账号
- 正式部署时建议使用你自己的初始化方式

### 2. 启动后端

进入目录：

```bash
cd development-hub-backend
```

配置环境变量：

```bash
DB_URL=jdbc:mysql://localhost:3306/attendance_system?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=replace-with-a-secure-secret
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

运行：

```bash
mvn spring-boot:run
```

默认后端地址：

```text
http://localhost:8080
```

### 3. 启动前端

进入目录：

```bash
cd ai-assisted-development-hub
```

安装依赖并运行：

```bash
npm install
npm run dev
```

默认前端地址：

```text
http://localhost:5173
```

如需单独指定接口地址，可创建 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SPRING_AI_API_BASE=http://localhost:8080/api/ai
```

## AI 联调说明

本项目已接入 Spring AI，后端日志会明确输出当前请求是否真正走到了大模型。

如果后端日志出现：

```text
AI chat succeeded via Spring AI ...
AI summary succeeded via Spring AI ...
```

说明 AI 已经真实调用成功。

如果出现：

```text
fallback
disabled
Spring AI chat failed
```

说明当前请求走的是本地兜底逻辑，而不是模型真实返回。

## 文档列表

- 前端项目说明：[ai-assisted-development-hub/README.md](./ai-assisted-development-hub/README.md)
- 接口文档：[ai-assisted-development-hub/API-DOCUMENTATION.md](./ai-assisted-development-hub/API-DOCUMENTATION.md)
- 后端项目说明：[development-hub-backend/README.md](./development-hub-backend/README.md)

## GitHub 上传说明

### 你现在为什么不能直接在根目录执行 `git add .`

因为你当前目录结构里：

- `ai-assisted-development-hub/` 自己已经有一个 `.git`
- `development-hub-backend/` 自己也已经有一个 `.git`

如果你直接在根目录新建 Git 仓库并执行：

```bash
git add .
```

Git 会把这两个子目录当作“嵌套仓库”处理，而不是普通文件夹，这通常不是你想要的结果。

### 如果你想把前后端合并成一个新的 GitHub 总仓库

推荐做法：

1. 先保留当前代码目录不动
2. 将两个子项目内部的 `.git` 目录移走或备份
3. 然后在根目录重新初始化 Git

示例流程：

```bash
cd F:\FuckGraduationProject

ren ai-assisted-development-hub\.git .git.bak
ren development-hub-backend\.git .git.bak

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ReappealXy/attendance-management-system.git
git push -u origin main
```

说明：

- 如果你后续确认不再需要两个子仓库原来的提交历史，可以删除 `.git.bak`
- 如果你还想保留原来的历史，先不要删，留作备份

### 如果你想继续保留“前后端各自独立仓库”

那就不要在根目录新建总仓库，而是分别进入两个目录各自 push。

## SVG 与静态资源要不要带上

要带，但要分清哪些该带，哪些不该带。

### 建议提交到 GitHub 的 SVG

以下属于源码或静态资源，应该提交：

- `ai-assisted-development-hub/public/favicon.svg`
- `ai-assisted-development-hub/public/placeholder.svg`

这些文件会参与前端构建，是项目资源的一部分。

### 不建议提交的 SVG

以下不需要提交：

- `ai-assisted-development-hub/dist/` 下生成的 SVG
- `node_modules/` 里的第三方 SVG

原因：

- `dist/` 是构建产物，可以重新生成
- `node_modules/` 是依赖目录，不应该上传源码仓库

## 仓库命名建议

GitHub 仓库名建议使用英文或拼音，README 标题再写中文毕业设计名称。

推荐仓库名：

```text
attendance-management-system
```

推荐仓库描述：

```text
毕业设计：基于 React、TypeScript、Vite 与 Spring Boot、Spring Security、MyBatis-Plus、MySQL 构建的考勤管理系统（Attendance Management System），集成登录认证、JWT 鉴权、考勤打卡、请假审批、员工管理、部门管理、考勤规则配置、统计报表导出与 Spring AI 智能分析，适用于高校毕业设计展示与企业考勤场景演示。
```

## 脱敏处理说明

为了方便后续公开上传到 GitHub，已经完成以下处理：

- 移除了后端配置中的默认数据库密码
- 移除了默认 OpenAI API Key
- 将数据库脚本中的超级管理员账号改成通用演示账号
- 将前端默认占位 README 替换为正式项目说明

## 备注

如果你后面准备部署到云服务器，推荐继续保持这种“前后端同目录、前后端分离部署”的结构：

- 前端构建后交给 Nginx 提供静态资源
- 后端以 Spring Boot jar 方式运行
- MySQL 单独部署或与服务端部署在同一台机器

这个结构对毕业设计展示、答辩说明、GitHub 展示和后续部署都比较清晰。
