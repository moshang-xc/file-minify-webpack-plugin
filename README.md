# file-minify-webpack-plugin
webpack文件压缩插件，同时可以进行文件的拷贝移动，参考copy-webpack-plugin

可以对当前的静态文件进行移动和压缩(html,css,js,json)

## 安装

```bash
npm i -D copy-webpack-plugin
```

## 使用

**webpack.config.js**
```js
const FileMinifyWebpackPlugin = require('file-minify-webpack-plugin')

const config = {
  plugins: [
    new FileMinifyWebpackPlugin([ ...options ], globOption)
  ]
}
```


### `options`


|属性|类型|默认值|描述|
|:--:|:--:|:-----:|:----------|
|[`from`](#from to)|`{String}`|`undefined`|需要匹配的文件，接受[minimatch options](https://github.com/isaacs/minimatch)表达式|
|[`to`](#from to)|`{String}`|`空`|输出文件的地址，为空默认输出到`output`根目录下|
|[`force`](#force)|`{Boolean}`|`false`|是否重写已写入 `compilation.assets` 中的文件，即覆盖其它`plugins/loaders`处理过的文件|
|[`ignore`](#ignore)|`{Array/String}`|`[]`|`from`文件中需要忽略的文件|
|[`minify`](#minify)|`{Boolean}`|`bool`|是否对匹配的文件进行压缩|
|`flatten`|`{Boolean}`|`false`|删除所有目录引用，仅复制文件名，如果文件同名，则可能出现覆盖的情况|
|[`transform`](#transform)|`{Function\|Promise}`|`(content, path) => content`|在文件输出之前，对文件内容进行修改或其它操作，content为`compilation.assets[xxx].source()`|
|[`context`](#context)|`{String}`| 空 |`from`的根路径，可不填|
|[`options`](#options)|`{Object}`|`{}`|压缩配置参数|

### `from to`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    { from: ',/common/', to: '/to/dest/' },
    { from: '/common**/*.html', to: '/to/dest/' }
  ], globOption)
]
```

### `force`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', force: true }
  ], globOption)
]
```

### `ignore`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', ignore: [ '*.js' ] }
  ], globOption)
]
```

### `flatten`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    { from: 'src/**/*', to: 'dest/', flatten: true }
  ], globOption)
]
```

### `transform`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    {
      from: 'src/*.png',
      to: 'dest/',
      transform (content, path) {
        return optimize(content)
      }
    }
  ], globOption)
]
```

### `context`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin([
    { from: 'src/*.txt', to: 'dest/', context: 'app/' }
  ], globOption)
]
```


### `options`
代码压缩分别通过[UglifyJs](https://github.com/mishoo/UglifyJS2)、[Clean-Css](https://github.com/jakubpawlowicz/clean-css)、[Html-Minifier](https://github.com/kangax/html-minifier)进行`JS`、`CSS`、`HTML`压缩

**webpack.config.js**
```js

[
  new FileMinifyWebpackPlugin([
    { from: 'src/*.txt', to: 'dest/', option: {
        mangle : false
        ...
    }}
  ], globOption)
]
```

## globOption

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|[`debug`](#debug)|`{String}`|**`'warning'`**|[Debug Options](#debug)|
|[`ignore`](#ignore)|`{Array}`|`[]`|全局需要忽略的`from`文件，对所有的option生效|
|[`context`](#context)|`{String}`|`compiler.options.context`|全局上下文根目录|

### `debug`

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`'info'`**|`{String\|Boolean}`|`false`|文件位置信息和读取信息输出|
|**`'debug'`**|`{String}`|`false`|详细的debug信息输出|
|**`'warning'`**|`{String}`|`true`|警告信息输出|

#### `'info'`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin(
    [ ...patterns ],
    { debug: 'info' }
  )
]
```

#### `'debug'`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin(
    [ ...patterns ],
    { debug: 'debug' }
  )
]
```

#### `'warning' (default)`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin(
    [ ...patterns ],
    { debug: true }
  )
]
```

### `ignore`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin(
    [ ...patterns ],
    { ignore: [ '*.js', '*.css' ] }
  )
]
```

### `context`

**webpack.config.js**
```js
[
  new FileMinifyWebpackPlugin(
    [ ...patterns ],
    { context: '/app' }
  )
]
```

