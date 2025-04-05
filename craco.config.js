// craco.config.js
const path = require('path');
const fs = require('fs');

module.exports = {
  babel: {
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      "babel-plugin-transform-typescript-metadata",
    ],
  },
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@appTypes': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    configure: (webpackConfig) => {
      // Suppress source map warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
      ];
      webpackConfig.module.rules.push({
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
            plugins: [
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              ["@babel/plugin-transform-private-methods", { loose: true }],
              ["@babel/plugin-transform-private-property-in-object", { loose: true }],
              "babel-plugin-transform-typescript-metadata",
            ],
          },
        }],
      });

      webpackConfig.module.rules.push({
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: [
          /node_modules\/@inversifyjs\/core/,
          /node_modules\/@inversifyjs\/prototype-utils/,
          /node_modules\/@inversifyjs\/reflect-metadata-utils/,
        ],
      });

      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    const certsDir = path.resolve(__dirname, 'certs/react-app');
    const keyPath = path.join(certsDir, 'key.pem');
    const certPath = path.join(certsDir, 'cert.pem');

    if (process.env.HTTPS === 'true' && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      devServerConfig.https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    if (!devServerConfig.devMiddleware) {
      devServerConfig.devMiddleware = {};
    }

    if (!devServerConfig.devMiddleware.headers) {
      devServerConfig.devMiddleware.headers = {};
    }

    devServerConfig.devMiddleware.headers['Service-Worker-Allowed'] = '/';

    return devServerConfig;
  },
};
