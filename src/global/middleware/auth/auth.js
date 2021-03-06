import Vue from 'vue';
import auth from '@/global/features/router/auth/index';
export const loginAuth = function (to, from, next, appConfig) {
    const currentPath = appConfig.base + to.path;
    const authOptions = {
        tipMessage: appConfig.router.tipMessage,
        noLogin: appConfig.router.noLogin,
        unauthorized: appConfig.router.unauthorized,
        domainName: appConfig.domainName,
    };
    return auth.getUserInfo().then(() => auth.getUserResources(authOptions.domainName).then(() => {
        if (auth.has(currentPath))
            next();
        else
            throw new Error('Unauthorized');
    }).catch(() => {
        authOptions.tipMessage && Vue.prototype.$toast.show(authOptions.tipMessage);
        const unauthorized = typeof authOptions.unauthorized === 'function' ? authOptions.unauthorized(to) : authOptions.unauthorized;
        next(unauthorized);
    }), () => {
        authOptions.noLogin(next);
    });
};

