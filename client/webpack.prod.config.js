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
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.join(__dirname, 'tsconfig.json'),
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    },

    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'draft-js': 'Draft',
        'jquery': '$',
        'immutable': 'Immutable',
        'prop-types': 'PropTypes'
    },

    plugins: [
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: false
        })
    ]
}