import Vue from 'vue';
import VueRouter from 'vue-router';

import routerLock from '@/global/features/router/lock';
import AuthPlugin from './auth/vue';
import { beforeMiddleware, afterMiddleware } from './middleware';

Vue.use(VueRouter);

export default function (routes, base, appConfig) {
    base = base || appConfig?.router.base;
    const router = new VueRouter({
        routes,
        base,
        mode: 'history',
        scrollBehavior(to, from, savedPosition) {
            if (to.hash) {
                return {
                    selector: to.hash,
                };
            }
            if (savedPosition) {
                return savedPosition;
            } else {
                return { x: 0, y: 0 };
            }
        },
    });
    beforeMiddleware(router, appConfig);
    Vue.use(routerLock);

    if (appConfig.auth) {
        routes[0].meta = routes[0].meta || {};
        routes[0].meta.auth = 'loginAuth';
    }

    Vue.use(AuthPlugin, {
        base,
        router,
        autoHide: true,
    });
    afterMiddleware(router, appConfig);

    return router;
}
