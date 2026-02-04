import path from 'path';
import type { UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport = {
    projectName: 'miniprogram',
    date: '2026-02-04',
    designWidth: 750,
    deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2,
        375: 2 / 1
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-framework-react'],
    defineConstants: {},
    copy: {
        patterns: [],
        options: {}
    },
    framework: 'react',
    compiler: {
        type: 'webpack5',
        prebundle: { enable: false }
    },
    cache: {
        enable: false
    },
    alias: {
        '@': path.resolve(__dirname, '../src'),
        '@mini': path.resolve(__dirname, './src')
    },
    sass: {
        data: `@import "@/theme/colors.scss";`
    },
    mini: {
        postcss: {
            pxtransform: {
                enable: true,
                config: {}
            },
            url: {
                enable: true,
                config: {
                    limit: 1024
                }
            },
            cssModules: {
                enable: false,
                config: {
                    namingPattern: 'module',
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        webpackChain(chain) {
            chain.resolve.alias
                .set('@', path.resolve(__dirname, '../src'))
                .set('@mini', path.resolve(__dirname, './src'));
        }
    },
    h5: {
        publicPath: '/',
        staticDirectory: 'static',
        output: {
            filename: 'js/[name].[hash:8].js',
            chunkFilename: 'js/[name].[chunkhash:8].js'
        },
        miniCssExtractPluginOption: {
            ignoreOrder: true,
            filename: 'css/[name].[hash].css',
            chunkFilename: 'css/[name].[chunkhash].css'
        },
        postcss: {
            autoprefixer: {
                enable: true,
                config: {}
            },
            cssModules: {
                enable: false,
                config: {
                    namingPattern: 'module',
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        webpackChain(chain) {
            chain.resolve.alias
                .set('@', path.resolve(__dirname, '../src'))
                .set('@mini', path.resolve(__dirname, './src'));
        }
    }
};

export default config;
