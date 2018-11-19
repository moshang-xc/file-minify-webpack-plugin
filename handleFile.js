const path = require('path');
const globby = require('globby');
const minimatch = require('minimatch');
const isGlob = require('is-glob');
const {
    writeFile,
    writeContent
} = require('./utils/promisely');
const {
    stat
} = require('./utils/promisely');
const minify = require('./utils/minify');

function handle(option, globalRef) {
    const {
        context,
        info,
        debug,
        warning,
        compilation,
        fileDependencies,
        contextDependencies,
        inputFileSystem
    } = globalRef;

    // 确定当前操作的根路径
    if (option.context) {
        option.context = path.join(context, option.context);
    } else {
        option.context = context;
    }

    // 确定from的绝对路径
    if (path.isAbsolute(option.from)) {
        option.absoluteFromPath = option.from;
    } else {
        option.absoluteFromPath = path.resolve(option.context, option.from);
    }

    if (path.extname(option.to) === '' || option.to.slice(-1) === '/') {
        option.toType = 'dir';
    } else {
        option.toType = 'file';
    }

    // 读取路径信息，抽离出后续需要的数据
    const noStatsHandler = () => {
        // 如果不是路路劲，确认是否是表达式
        if (isGlob(option.from) || option.from.indexOf('*') !== -1) {
            option.fromType = 'glob';
            option.pattern = path.resolve(option.context, option.from);
        } else {
            const msg = `unable to locate '${option.from}' at '${option.absoluteFromPath}'`;
            const warningMsg = `[file-minify-webpack-plugin] ${msg}`;
            // only display the same message once
            if (compilation.errors.indexOf(warningMsg) === -1) {
                warning(msg);
                compilation.errors.push(warningMsg);
            }

            option.fromType = 'nonexistent';
        }
    };

    // 判断路劲是否存在
    return stat(inputFileSystem, option.absoluteFromPath)
        .catch(() => noStatsHandler())
        // 数据处理以供文件处理使用
        .then((stat) => {
            if (!stat) {
                noStatsHandler();
                option.fromArgs = {
                    cwd: option.context,
                    dot: true
                };
                return option;
            }

            // 如果当前是文件夹
            if (stat.isDirectory()) {
                option.fromType = 'dir';
                option.context = option.absoluteFromPath;
                // 全局搜索表达式
                option.pattern = path.join(option.absoluteFromPath, '**/*');
                // 搜索匹配参数
                option.fromArgs = {
                    cwd: option.context,
                    dot: true
                };
            } else if (stat.isFile()) {
                option.fromType = 'file';
                option.context = path.dirname(option.absoluteFromPath);
                option.pattern = option.absoluteFromPath;
                option.fromArgs = {
                    cwd: option.context,
                    dot: true
                };
            } else if (!option.fromType) {
                info(`Unrecognized file type for ${option.from}`);
            }
            return option;
        })
        // 文件处理操作
        .then((option) => {
            // 文件不存在直接resolve
            if (option.fromType === 'nonexistent') {
                info(`from path ${option.absoluteFromPath} not exist`);
                return Promise.resolve();
            }

            // 在指定的路径下面匹配文件
            return globby(option.pattern, option.fromArgs)
                .then((paths) => {
                    if (paths.length === 0) {
                        warning(`path ${option.pattern} matchs no file.`);
                        return Promise.resolve();
                    }
                    return Promise.all(paths.map((from) => {
                        let file = {
                            fromPath: path.resolve(option.context, from),
                            webpackTo: from
                        };
                        file.webpackTo = path.relative(option.context, file.fromPath);
                        file.fileType = option.fileType || path.extname(file.fromPath).replace(/^\./, '').toLowerCase();

                        // 去除文件路径
                        if (option.flatten) {
                            file.webpackTo = path.basename(from);
                        }

                        // 筛选出排除的文件
                        for (let i = 0, ignore; ignore = option.ignore[i]; i++) {
                            if (minimatch(file.webpackTo, ignore)) {
                                info(`${from} was ignore`);
                                return Promise.resolve();
                            }
                        }

                        // Change the to path to be relative for webpack
                        if (option.toType === 'dir') {
                            file.webpackTo = path.join(option.to, file.webpackTo);
                        } else if (option.toType === 'file') {
                            file.webpackTo = option.to || file.webpackTo;
                        } else {
                            file.webpackTo = path.join(option.to, file.webpackTo);
                        }

                        // 如果文件已存在，且不覆盖，则不做任何处理
                        if (compilation.assets[file.webpackTo] && !option.force) {
                            info(`skipping '${file.webpackTo}', because it already exists`);
                            return Promise.resolve();
                        }

                        file.webpackTo = file.webpackTo.replace(/\\/g, '/');

                        let asset;
                        if (asset = compilation.assets[file.webpackTo]) {
                            let content = asset.source();
                            // 配置是否需要压缩
                            if (option.minify) {
                                try {
                                    content = minify(content, file.fileType, option.options);
                                } catch (e) {
                                    info(`minify '${file.fromPath}' failed`);
                                }
                            }

                            info(`writing '${file.webpackTo}' to compilation assets from '${file.fromPath}'`);
                            return writeContent(compilation, file.webpackTo, content);
                        } else {
                            return writeFile(option, globalRef, file);
                        }

                    }));
                });
        });
}

module.exports = handle;