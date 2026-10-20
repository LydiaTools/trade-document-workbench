# 运行与修改

以下命令均在仓库根目录运行。项目使用 HTML、CSS 和 JavaScript，无服务端、API 密钥或云端数据库。

## 运行源码

安装 Python 3 后执行：

```sh
python3 -m http.server 8769 --bind 127.0.0.1 --directory src
```

打开 <http://127.0.0.1:8769/>。修改 `src` 文件后刷新页面即可。

也可以使用已经打包的 `dist/单证工作台.html`。单文件包含样式、脚本、依赖库和相应版权说明。

## 构建与检查

需要 Node.js；第三方库已随源码附带，不需要 `npm install`。

```sh
npm test
npm run build
```

`npm test` 运行 10 项基础计算检查和 8 项装箱检查。构建结果为 `dist/单证工作台.html`。

2026-10-20 在 Node.js 22.23.0 下重新运行，两组检查共 18 项通过。重新构建的 HTML 与原始 v2 文件一致：

```text
SHA-256 d54b5a47b13ba378e0c8576b707ed30e8a7330cb5114a5a78f06c11cc7269bfd
```

浏览器完整交互、双击 file 地址、下载及文件选择恢复没有在这次源码上传中重新验收。

## 文件对应的工作

| 文件 | 用途 |
| --- | --- |
| `src/index.html` | 页面入口 |
| `src/app.js` | 订单、产品与客户资料、历史版本、单据排版和 PDF 导出 |
| `src/core.js` | 精确金额计算、输入校验与 CSV 处理 |
| `src/packing.js` | 实际装箱计算、混装去重与数量核对 |
| `src/packing-ui.js` | 装箱表导入、编辑、核对与工厂 CSV 导出 |
| `src/styles.css` | 工作台与单据样式 |
| `src/vendor/` | 随包附带的第三方库和许可证 |
| `scripts/build.cjs` | 将源码合成一个 HTML 文件 |
| `tests/` | 基础计算与装箱检查 |
| `交付检查.json` | 当前文件校验值与本轮验证记录 |

## 保存与迁移

业务资料保存在当前浏览器的 localStorage。导出的完整 JSON 备份包含当前订单、产品、客户和历史版本；恢复前先备份现有工作区。

`.gitignore` 已排除常见订单备份、业务导出、环境配置和日志。源码内置的订单与产品为演示填充值，仓库不需要真实客户或订单数据才能运行。
