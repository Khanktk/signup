import { createRouter, createWebHistory } from 'vue-router';
import SignUpForm from '../components/SignupForm.vue';
import LoginForm from '../components/LoginForm.vue';
import Dashboard from '../components/Dashboard.vue'


// define router component by importing
const routes = [

    {
        path: '/' ,
        name: 'signup',
        component: SignUpForm,
        meta: {
          title: 'Sign Up'
        }
    },
    {
        path: '/login' ,
        name: 'login',
        component: LoginForm,
         meta: {
          title: 'Log In'
        }
    },
    {
        path: '/dashboard' ,
        name: 'dashboard',
        component: Dashboard,
        meta: {
          requiresAuth: true,
          title: 'Dashboard'
        }
    },
]


const router = createRouter({

    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
})

// Route Guard
router.beforeEach((to, from, next) => {
  const loggedInUser = localStorage.getItem("currentUser")

  // 1. If not logged in then block dashboard
  if (to.meta.requiresAuth && !loggedInUser) {
    return next("/login")
  }

  // 2. If logged in then block signup and login pages
  if (loggedInUser && (to.path === "/" || to.path === "/login")) {
    return next("/dashboard")
  }
  document.title = to.meta.title || "Vue App"
  next()
})


export default router