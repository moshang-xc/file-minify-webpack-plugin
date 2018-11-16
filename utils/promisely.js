const minify = require('./minify');
const path = require('path');

function stat(inputFileSystem, path) {
    return new Promise((resolve, reject) => {
        inputFileSystem.stat(path, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function readFile(inputFileSystem, path) {
    return new Promise((resolve, reject) => {
        inputFileSystem.readFile(path, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function writeFile(option, globalRef, file) {
    const {
        info,
        debug,
        compilation,
        fileDependencies,
        written,
        inputFileSystem,
        copyUnmodified
    } = globalRef;


    return stat(inputFileSystem, file.fromPath)
        .then((stat) => {
            if (stat.isDirectory()) {
                return;
            }
            info(`reading ${file.fromPath} to write to assets`);
            return readFile(inputFileSystem, file.fromPath)
                .then((content) => {
                    if (option.transform) {
                        const transform = (content, fromPath) => {
                            return option.transform(content, fromPath);
                        };
                        content = transform(content, file.fromPath);
                    }

                    return content;
                }).then((content) => {
                    info(`writing '${file.webpackTo}' to compilation assets from '${file.fromPath}'`);

                    if (option.minify) {
                        try {
                            content = minify(content, file.fileType, option.options);
                        } catch (e) {
                            info(`minify '${file.fromPath}' failed`);
                        }
                    }

                    writeContent(compilation, file.webpackTo, content);
                });
        });
}

function writeContent(compilation, webpackTo, content) {
    compilation.assets[webpackTo] = {
        size: function() {
            return content.byteLength;
        },
        source: function() {
            return content;
        }
    };
}

module.exports = {
    stat,
    readFile,
    writeFile,
    writeContent
};