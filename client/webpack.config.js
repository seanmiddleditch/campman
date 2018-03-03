const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'client.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        publicPath: '/js/',
        libraryTarget: 'window'
    },

    mode: 'production',

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
        rules: [
            // Typescript
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: path.join(__dirname, 'tsconfig.json'),
                    transpileOnly: true
                }
            },

            // Generate source maps
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },

    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'draft-js': 'draft-js',
        'jquery': '$'
    },

    plugins: [
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map'
        })
    ]
}