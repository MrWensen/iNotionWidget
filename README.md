# [iNotionWidget](/iNotionWidget.js)
基于Scriptable构建的小组件
![明亮状态](/image/image1.png)
![暗黑状态](/image/image2.png)
去年的时候想玩一下ios的小组件，在🍠上发现了Scriptable，但是不会自己书写js，于是使用着上面提供的小组件[iTermWidget](https://github.com/yaylinda/scriptable/blob/main/TerminalWidget.js)，该组件提供了相当丰富的信息展示，使用过一段时间后，发现只能用到部分内容，而多数内容使用不到，为了更方便的使用，开始了第一次改写。

---

## [Notion](/Notion.js)

![Notion](/image/image3.jpg)
在接触Notion的过程中，发现Notion的小组件直观方便，于是在[iTermWidget](https://github.com/yaylinda/scriptable/blob/main/TerminalWidget.js)的基础上更改输出内容。使用一段时间后，达不到理想的显示效果，于是决定全部推倒重来。

利用[Scriptable Docs](https://docs.scriptable.app/widgetstack/)与其他开发者开发的小组件，在这些的基础上，开始从0打造理想中的Widget，在各种资料的帮助下，半天左右的时间便完成了雏形，并且完全根据需求搭建，避免了冗余的代码及各种莫名其妙的BUG。

---

## 用途

iNotionWidget能够显示日历中两个日程的今明两日的安排，并以24h的格式显示日程开始的时间，以及显示日程标题。第三栏内容用于获取所在地的天气，天气的图标是动态变化的，另外显示当前温度，今日温度范围。

## 如何使用

在Scriptable中添加完之后，你需要输入iPhone日历中的两个日程安排的标题，一个为工作，一个为个人，另外需要一个[OpenWeatherMap](https://openweathermap.org/api)的api，这个可以找一个共享的也可以自己申请一个，都不困难，最后在桌面添加小组件即可。

---

如果觉得做的不错，请给该项目🌟，谢谢！
