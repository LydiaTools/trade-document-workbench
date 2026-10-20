# 第三方库与版权说明

单证工作台随源码附带以下库，用于生成 PDF 和 ZIP。版本信息依据收到的源码包及随附文件记录；本轮没有升级依赖。

| 库 | 随包版本 | 用途 | 许可证文件 |
| --- | --- | --- | --- |
| jsPDF | 4.2.1 | PDF 文档生成 | [LICENSE-jspdf.txt](src/vendor/LICENSE-jspdf.txt) |
| html2canvas | 1.4.1 | 将单据排版绘制为图像 | [LICENSE-html2canvas.txt](src/vendor/LICENSE-html2canvas.txt) |
| fflate | 0.8.3 | 将多份 PDF 打包为 ZIP | [LICENSE-fflate.txt](src/vendor/LICENSE-fflate.txt) |

原有版权和许可文本保持不变。构建脚本将这三份许可文本嵌入独立 HTML 文件。

这里记录第三方依赖的许可，不替项目本身设定开源许可。
