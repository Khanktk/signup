import { createRouter, createWebHistory } from "vue-router"

import SignUpForm from "@/components/SignupForm.vue"
import LoginForm from "@/components/LoginForm.vue"
import Dashboard from "@/components/Dashboard.vue"
import Welcome from "@/components/Welcome.vue"
import AllPosts from "@/components/AllPosts.vue"
import CreatePost from "@/components/CreatePost.vue"

const routes = [
  {
    path: "/",
    name: "signup",
    component: SignUpForm,
    meta: { title: "Sign Up" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginForm,
    meta: { title: "Log In" },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: "Dashboard",
    },
    children: [
      {
        path: "",
        name: "dashboard-home",
        component: Welcome,
      },
      {
        path: "posts",
        name: "all-posts",
        component: AllPosts,
      },
      {
        path: "create",
        name: "create-post",
        component: CreatePost,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

//ROUTE GUARD

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken")

  // Block dashboard if not authenticated
  if (to.meta.requiresAuth && !token) {
    return next("/login")
  }

  // Block login & signup if already logged in
  if (token && (to.path === "/" || to.path === "/login")) {
    return next("/dashboard")
  }

  // Set page title
  document.title = (to.meta.title ) || "Vue App"

  next()
})

export default router
