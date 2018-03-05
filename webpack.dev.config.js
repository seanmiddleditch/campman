const webpack = require('webpack')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'src', 'client', 'client.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        publicPath: '/js/',
        libraryTarget: 'window'
    },

    mode: 'development',
    devtool: 'inline-source-map',

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
            },

            // Generate source maps
            {
                enforce: 'pre',
                test: /\.js$/,
                use: [
                    'source-map-loader'
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
        new HardSourcePlugin(),
    ]
}