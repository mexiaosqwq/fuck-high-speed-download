# 去他妈的高速下载！

去除国内各大软件/手游下载站的「高速下载」「安全下载」「软件管家」「九游」「应用宝」「360助手」等诱导按钮，只保留普通下载，并让其自适应铺满原下载条。

## 功能

- **自动隐藏所有诱导下载按钮** — 高速下载、安全下载、极速下载、软件管家、360助手、九游、应用宝、豌豆荚等
- **自动取消并删除推广勾选框** — 九游/应用宝/360助手的捆绑安装勾选
- **保留的普通下载按钮自动铺满整行** — 不再需要在一堆按钮里找那个小小的「普通下载」
- **同时处理页面主体和浮动下载条** — 滚动后出现的底部浮动条也会被清理

## 特点

- **无新增界面、无网络请求、不破坏页面排版** — 纯 CSS + DOM 操作
- **DOM 零痕迹** — WeakSet 标记，不写 `data-*` 属性
- **移动端省电** — 页面稳定后自动停止监听，滚动停止后 300ms 被动重跑
- **不误伤正常软件** — 不误伤 IDM、网游加速器、下载器类软件的正常下载入口

## 安装

- **Greasy Fork**：[点击安装](https://greasyfork.org/zh-CN/scripts/589268-去他妈的高速下载)
- **GitHub 直链**：[点击安装](https://raw.githubusercontent.com/mexiaosqwq/fuck-high-speed-download/main/%E5%8E%BB%E4%BB%96%E5%A6%88%E7%9A%84%E9%AB%98%E9%80%9F%E4%B8%8B%E8%BD%BD.js)

> 需要先安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展

## 已适配站点

| 站点 | 域名 |
|------|------|
| 多游游戏 | doyo.cn |
| 9663游戏 | 9663.com |
| 多多软件 | ddooo.com |
| 下载快 | downkuai.com |
| 游吧乐 | y8l.com |
| 手机中国 | shouji.com.cn |
| QQ腾飞 | qqtf.com |
| QQ下载 | qqtn.com |
| QT6 | qt6.com |
| 289游戏 | 289.com |
| 就爱拍 | j9p.com |
| 5577游戏 | 5577.com |
| 2265安卓 | 2265.com |
| 87G手游 | 87g.com |
| 7000游戏 | 7000.com |
| 7723游戏 | 7723.com |
| 3H3游戏 | 3h3.com |
| 华军软件园 | onlinedown.net |
| 系统之家 | xitongzhijia.net |
| 系统天地 | xitongtiandi.net |
| 下载站 | downza.cn |
| UCbug | ucbug.com |
| 32r软件 | 32r.com |
| 42下载 | 42xz.com |
| 下载吧 | xz7.com |
| PC6下载 | pc6.com |
| 下载吧 | xiazaiba.com |
| 西西软件园 | cr173.com |
| 瓷都下载 | cncrk.com |
| 华彩软件 | crsky.com |
| 我的下载 | mydown.com |
| 多特软件 | duote.com |
| UZZF | uzzf.com |
| 脚本之家 | jb51.net |
| 下载CC | downcc.com |
| 下载侠 | downxia.com |
| WinWin7 | winwin7.com |
| 历趣 | liqucn.com |
| 游侠网 | ali213.net |
| IT猫扑 | itmop.com |
| 小皮游戏 | xpgod.com |
| 极速下载 | jisuxz.com |
| 拇指玩 | wmzhe.com |
| 非常火 | veryhuo.com |
| PC0359 | pc0359.cn |

## 如需添加新站点

在 Tampermonkey 脚本设置中为脚本添加 `// @match *://*.新域名.com/*` 即可，无需修改代码。

如按钮未被正确清理，请在 [Issues](https://github.com/mexiaosqwq/fuck-high-speed-download/issues) 反馈页面地址。

## License

GPL