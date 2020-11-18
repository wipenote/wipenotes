import Vue from 'vue'
import VueRouter from 'vue-router'
import notFound from './middleware/notFound'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue'),
      },
      {
        path: '/:noteId/note-created',
        name: 'note-created',
        component: () => import('../views/NoteCreated.vue'),
      },
      {
        path: '/about-us',
        name: 'about-us',
        component: () => import('../views/AboutUs.vue'),
      },
      {
        path: '/:noteId',
        name: 'get-note',
        component: () => import('../views/Note.vue'),
      },
      
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL || '/',
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  }
})

export function createMiddlewarePipeline(context, middleware) {
  const nextMiddleware = middleware[0]
  const restMiddleware = middleware.slice(1)
  
  if (!nextMiddleware) {
    return context.next
  }
  
  return redirectRoute => {
    if (redirectRoute !== undefined) {
      context.next(redirectRoute)
    } else {
      const nextPipeline = createMiddlewarePipeline(context, restMiddleware)
      nextMiddleware({ ...context, next: nextPipeline })
    }
  }
}

router.beforeEach((to, from, next) => {
  const middleware = to.matched.reduce(
    (guards, matchedRoute) => {
      const routeGuards = matchedRoute.meta.middleware
        ? matchedRoute.meta.middleware.filter(someGuard => !guards.includes(someGuard))
        : []
      
      return routeGuards.length ? [...guards, ...routeGuards] : guards
    },
    [notFound]
  )
  
  createMiddlewarePipeline(
    {
      to,
      from,
      next,
      store: {}
      // store
    },
    middleware
  )()
})

export default router
