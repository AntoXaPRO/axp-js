const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[name].js',
        library: 'axpJs',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};