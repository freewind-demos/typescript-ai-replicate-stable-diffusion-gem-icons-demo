# AI 宝石图标生成器

使用 React + TypeScript + Ant Design + Vite 构建的 AI 图片生成交互页面。

## 输出格式

**PNG 格式** - SDXL 模型默认输出 PNG，支持透明背景，适合图标用途。

如需 JPEG 等其他格式，可在生成后用工具转换。

## 参数配置

### Replicate API Token
- 获取地址: https://replicate.com/account/api-tokens
- 费用: SDXL 模型约 $0.01-0.02/次，按需付费

### 模型参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `width/height` | 图片尺寸 | 512x512 |
| `num_inference_steps` | 推理步数，越多越精细 | 30 |
| `guidance_scale` | 提示词引导强度 | 7.5 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── App.tsx      # 主组件，包含配置表单和结果展示
├── App.css      # 组件样式
├── index.css    # 全局样式
└── main.tsx    # 入口文件
```

## 功能特性

- 多宝石类型选择 (Ruby, Emerald, Sapphire, Diamond, Amethyst, Topaz)
- 多种风格 (图标风格、写实风格、卡通风格、水晶透明风格)
- 透明/白色背景选择
- 可调节参数 (尺寸、步数、引导强度)
- Prompt 可编辑
- PNG 格式输出，支持透明背景
