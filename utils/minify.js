const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const htmlMinify = require('html-minifier');

const OPTION = {
    js: {
        mangle: false,
        output: {
            // 最紧凑的输出
            beautify: false,
            // 删除所有的注释
            comments: false,
            preamble: '/* TIEM:' + (new Date()) + ' */'
        },
        compress: {
            // 移除没用的代码
            dead_code: true,
            // 在UglifyJs删除没有用到的代码时不输出警告
            warnings: false,
            // 删除所有的 `console` 语句，可以兼容ie浏览器
            drop_console: true,
            // 内嵌定义了但是只用到一次的变量
            collapse_vars: true,
            // 提取出出现多次但是没有定义成变量去引用的静态值
            reduce_vars: true,
            // 优化if条件判断语句
            conditionals: false,
            // 连续声明变量，用逗号隔开来
            sequences: false,
            // 合并连续 var 声明
            join_vars: false
        },
        ie8: true
    },
    css: {},
    html: {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true
    }
};

function minify(content, type, option = {}) {
    if (typeof content !== 'string') {
        content = content.toString('utf-8');
    }
    let tOption = Object.assign({}, option, OPTION[type] || {}),
        value;
    switch (type) {
        case 'js':
            value = UglifyJS.minify(content, tOption);
            if (value && value.error) {
                global.console.log('uglifyjs error');
            } else {
                content = value.code;
            }
            break;
        case 'css':
            value = new CleanCSS(tOption).minify(content);
            content = value.styles;
            break;
        case 'json':
            content = JSON.stringify(JSON.parse(content));
            break;
        case 'html':
            content = htmlMinify.minify(content, tOption);
            break;
    }
    content = Buffer.from(content);
    return content;
}

module.exports = minify;