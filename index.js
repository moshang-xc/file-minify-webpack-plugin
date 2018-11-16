/**
 * options = [{
    from: '', // 必须是确定的文件路径或者文件夹
    to: '', // 若from是文件夹则to必须是文件夹，当from是文件时，to为文件夹，则需要将文件存到该文件夹下面
    ignore: '' || [], //忽略的文件，一般在from为文件夹时使用
    minify: true, // 是否压缩文件
    force: false,// 是否覆盖已有的文件，当其它loader或者plugin已经生成该文件时，是否进行覆盖，不建议设为true
    flatten: true, //是否移除路径，只保留对应的文件名
    context: '', //from,to,ignore对应的根路劲
    fileType: '' // js, css, json, html，若不设置，则根据文件类型进行判断启用那种压缩方式
    options: {} // 压缩配置文件，js通过uglifyjs压缩，html通过html-minify压缩，css通过clean-css压缩，json直接去除空格
}]
    others = {
        debug: false,
        ignore: '' || []
    }
 */

/**
 * 问题记录
 * 不报错的原因
 */


const handle = require('./handleFile');

function FileMinifyWebpackPlugin(options = [], others = {
    debug: 'warning'
}) {
    if (!Array.isArray(options)) {
        throw new Error('[file-minify-webpack-plugin] options must be an array');
    }

    others.debug = others.debug || 'warning';

    if (others.debug === true) {
        others.debug = 'info';
    }

    const debugLevels = ['warning', 'info', 'debug'];
    const debugLevelIndex = debugLevels.indexOf(others.debug);

    function log(msg, level) {
        if (level === 0) {
            msg = `WARNING - ${msg}`;
        } else {
            level = level || 1;
        }
        if (level <= debugLevelIndex) {
            console.log('[file-minify-webpack-plugin] ' + msg); // eslint-disable-line no-console
        }
    }

    function warning(msg) {
        log(msg, 0);
    }

    function info(msg) {
        log(msg, 1);
    }

    function debug(msg) {
        log(msg, 2);
    }

    const DEFALUT_OPTION = {
        minify: true,
        force: false,
        flatten: false,
        to: ''
    };

    const apply = (compiler) => {
        const context = compiler.options.context;
        let fileDependencies;
        let contextDependencies;

        const emit = (compilation, cb) => {
            debug('start emit');
            const callback = () => {
                debug('finishing emit');
                cb();
            };
            // 参数处理
            fileDependencies = [];
            contextDependencies = [];

            let globalRef = {
                info,
                debug,
                warning,
                context,
                compilation,
                fileDependencies,
                contextDependencies,
                inputFileSystem: compiler.inputFileSystem
            };

            // 确定调试环境的输出文件目录
            if (compiler.options.devServer && compiler.options.devServer.outputPath) {
                globalRef.output = compiler.options.devServer.outputPath;
            }

            let tasks = [];

            options.forEach(option => {
                option = Object.assign({}, DEFALUT_OPTION, option);

                tasks.push(Promise.resolve().then(() => {
                    return handle(option, globalRef);
                }));
            });

            Promise.all(tasks).then(() => callback())
                .catch((err) => {
                    compilation.errors.push(err);
                });
        };

        const afterEmit = (compilation, cb) => {
            debug('start afterEmit');
            const callback = () => {
                debug('finishing afterEmit');
                cb();
            };

            // 修改对应的信息
        };

        // 挂载到对应的勾子上面
        if (compiler.hooks) {
            const plugin = {
                name: 'FileMInifyPlugin'
            };

            compiler.hooks.emit.tapAsync(plugin, emit);
            // compiler.hooks.afterEmit.tapAsync(plugin, afterEmit);
        } else {
            compiler.plugin('emit', emit);
            // compiler.plugin('after-emit', afterEmit);
        }
    };

    return {
        apply
    };
}


FileMinifyWebpackPlugin['default'] = FileMinifyWebpackPlugin;
module.exports = FileMinifyWebpackPlugin;