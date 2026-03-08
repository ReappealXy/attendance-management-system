# 考勤管理系统前端

这是考勤管理系统的前端项目，基于 `Vite + React + TypeScript + shadcn/ui + Tailwind CSS` 构建，面向员工和管理员提供登录、打卡、审批、人员管理、统计报表与 AI 助手交互界面。

## 项目说明

- 前端页面原型与交互基础由 Lovable 生成
- 接口文档初稿位于 [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)，由 Lovable 生成后再结合联调结果持续修订
- 后端联调、问题修复、功能补全与代码审查由 Codex 完成

## 目录结构

```text
src/
  components/      公共组件与布局
  contexts/        认证上下文
  hooks/           自定义 hooks
  lib/             mock 数据与工具函数
  pages/           页面级组件
  services/        API 请求与类型定义
public/            静态资源
```

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:5173
```

## 环境变量

前端默认请求本地后端 `http://localhost:8080/api`。如需修改，可创建 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SPRING_AI_API_BASE=http://localhost:8080/api/ai
```

## 构建命令

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

## 主要页面

- `/dashboard` 工作台
- `/attendance` 考勤打卡
- `/approval` 审批管理
- `/employees` 人员管理
- `/departments` 部门管理
- `/rules` 考勤规则
- `/reports` 统计报表
- `/profile` 个人中心

## 配套文档

- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
- 根目录整合文档：放入统一仓库后建议查看上级目录 `README.md`
