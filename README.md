# GeekDesign Viewer

GeekDesign 的 **本地 Sketch 查看** 静态站，部署在 GitHub Pages。

源码来自主仓库 [Leskur/geek-design](https://github.com/Leskur/geek-design)；本仓库负责发布，并存放演示用 Sketch 示例。

## 站点

打开后即可选择本机 `.sketch` 文件，也可直接使用页面上的 **打开示例文件**。文件仅在浏览器内处理，不会上传。

- 站点：https://leskur.github.io/geek-design-viewer/
- 示例文件：[`examples/geekdesign-demo.sketch`](examples/geekdesign-demo.sketch)（仿 README 截图的 MONO 任务/项目演示稿，不含真实业务内容）
- 完整版（含团队服务）：https://github.com/Leskur/geek-design

## 示例稿

`examples/geekdesign-demo.sketch` 保存在本仓库。部署时会复制进站点 `examples/` 目录。

若要重新生成（需能解析 `@zip.js/zip.js`，可用主仓依赖）：

```sh
NODE_PATH=../geek-design/node_modules node scripts/build-demo-sketch.mjs
```

会写回 `examples/geekdesign-demo.sketch`。

## 如何部署

1. 在本仓库 **Settings → Pages** 将 Source 设为 **GitHub Actions**
2. 在主仓库 [Leskur/geek-design](https://github.com/Leskur/geek-design) 配置 secret `VIEWER_DEPLOY_TOKEN`（能对 `Leskur/geek-design-viewer` 执行 `actions:write` 的 PAT）
3. **默认**：向主仓库 `main` 推送会影响 viewer 构建的代码时，会自动触发本仓库的 **Deploy GitHub Pages**
4. **本仓库**：改 `examples/` 或本 workflow 并推送到 `main` 也会部署；也可在 Actions 里手动运行 **Deploy GitHub Pages**
5. 构建会拉取 `Leskur/geek-design@main`，以 `VITE_LOCAL_ONLY=1` 与 `VITE_BASE=/geek-design-viewer/` 执行 `npm run build:viewer`，再并入本仓库示例文件

主仓库需为 public，或为本 workflow 配置可读取源码的 token。
