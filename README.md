# GeekDesign Viewer

GeekDesign 的 **本地 Sketch 查看** 静态站，部署在 GitHub Pages。

源码来自主仓库 [Leskur/geek-design](https://github.com/Leskur/geek-design)；本仓库只负责构建与发布，不存放业务源码。

## 站点

打开后即可选择本机 `.sketch` 文件。文件仅在浏览器内处理，不会上传。

- 站点：https://leskur.github.io/geek-design-viewer/
- 完整版（含团队服务）：https://github.com/Leskur/geek-design

## 如何部署

1. 在本仓库 **Settings → Pages** 将 Source 设为 **GitHub Actions**
2. 打开 **Actions**，运行 **Deploy GitHub Pages**（`workflow_dispatch`），或向 `main` 推送以触发
3. 构建会拉取 `Leskur/geek-design@main`，以 `VITE_LOCAL_ONLY=1` 与 `VITE_BASE=/geek-design-viewer/` 执行 `npm run build:viewer`

主仓库需为 public，或为 workflow 配置可读取源码的 token。
