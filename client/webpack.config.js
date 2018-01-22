const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: __dirname + '/client.ts',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist',
        publicPath: '/dist/',
        libraryTarget: 'window'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
        rules: [
            // CSS loaders
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader']
                })
            },

            // Typescript
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: __dirname + '/tsconfig.json',
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
        'jquery': '$'
    },

    plugins: [
        new ExtractTextPlugin({
            filename: "style.css",
            allChunks: true
        }),
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map'
        })
    ]
}