const host = 'localhost';
const path = require('path');
const pkg = require('./package.json');
const platformConfig = require('./platform.config.json');
if (!platformConfig.tenantId || !platformConfig.projectId) {
    console.error('parse platform.config error');
    process.exit(1);
}
const onProxyReq = function (proxyReq, req, res) {
    proxyReq.removeHeader('x-forwarded-proto');
    proxyReq.removeHeader('x-forwarded-host');
    proxyReq.removeHeader('x-forwarded-port');
    proxyReq.removeHeader('x-forwarded-for');

    const cookies = {};
    let cookie = proxyReq.getHeader('cookie');
    cookie = typeof cookie === 'string' ? cookie.split('; ') : cookie;
    if (Array.isArray(cookie)) {
        cookie.forEach((item) => {
            const arr = item.split('=');
            if (arr.length === 2)
                cookies[arr[0].toLowerCase()] = arr[1].trim();
        });
    }
    cookies.authorization && proxyReq.setHeader('authorization', cookies.authorization);
    cookies.username && proxyReq.setHeader('username', cookies.username);
    proxyReq.setHeader('DomainName', pkg.name.replace(/-client$/, ''));

    // console.log(proxyReq.path, proxyReq.getHeaders());
};
module.exports = function (port) {
    return {
        host,
        port,
        progress: !process.env.SERVER_DEVELOP,
        open: true,
        disableHostCheck: true,
        contentBase: path.join(__dirname),
        watchContentBase: false, // dev slow on Windows
        clientLogLevel: 'info',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
        proxy: {
            '^/gateway/': {
                target: 'http://api.gateway.lowcode',
                changeOrigin: true,
                autoRewrite: true,
                onProxyReq,
            },
            '^/gw/': {
                target: `http://${platformConfig.tenantId}-${platformConfig.projectId}.gateway.lowcode`,
                changeOrigin: true,
                autoRewrite: true,
                onProxyReq,
            },
        },
    };
};
