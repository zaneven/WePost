# WePost 贡献与开发协作指南 (CONTRIBUTING.md)

感谢你对 **WePost** 项目的关注与贡献！为了保持高质量的代码库与高效的团队协作，请在提交代码前仔细阅读本指南。

---

## 1. 行为准则与项目规则

1. **中文沟通**：所有 Issue、PR 描述、代码注释与任务讨论统一使用中文。
2. **矢量图标规范**：前端开发严禁使用任何 Emoji 字符，一律使用矢量图标（推荐 `lucide-react`）。
3. **Admin 部署约束**：任何涉及 admin（后台管理）的代码改动，必须确保构建与测试无误，并在合并后部署至生产环境。

---

## 2. 开发流程

### 2.1 创建分支
从 `main` 分支切出特性或修复分支：
```bash
# 特性分支
git checkout -b feat/your-feature-name

# 修复分支
git checkout -b fix/your-bug-fix
```

### 2.2 提交信息规范 (Conventional Commits)
遵循标准提交格式：
```
<type>(<scope>): <subject>
```

- `feat`: 新增功能
- `fix`: 修复问题
- `docs`: 文档变动
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建与脚手架工具

### 2.3 代码检查与测试
在提交前确保运行以下命令并全部通过：
```bash
# 代码风格检查
npm run lint

# 单元测试
npm test
```

---

## 3. Pull Request 规范

1. PR 标题清晰表达变动内容（如 `feat(parser): add code block highlight themes`）。
2. PR 描述请列出：
   - 本次修改的目的与背景
   - 主要变动点
   - 自测与验证情况（附截图/录屏，注意前端不要包含 Emoji）
