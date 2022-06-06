apizza2apipost 是一个apizza JSON 到 ApiPost 导入项目数据 的转换器。

# 🎉 特性

- 支持格式 
- apizza 1.0
# 安装

```shell
npm i apizza2apipost
```

# 基础使用
需引入：

```js
import apizza2apipost from 'apizza2apipost';
const converter = new apizza2apipost();
const convertResult= converter.convert(apizzaJson);
```
**检查结果:**

```js
convertResult.status === "error"
```
**对于不成功的转换。检查 convertResult.message**

```js
convertResult.status === "success"
```
**成功转换,结果在convertResult.data中**

# 开源协议

apizza2apipost 遵循 [MIT 协议](https://github.com/Apipost-Team/apizza2apipost)。
