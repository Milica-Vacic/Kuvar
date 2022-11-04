import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import ContactPage from '../views/ContactPage.vue'
import store from '../store/index.js'
import axios from 'axios'
import User from '../javascript/User'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/contact',
    name: 'ContactPage',
    component: ContactPage
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: () => import(/* webpackChunkName: "recipes" */ '../views/Recipes.vue')
  },
  {
    path: '/recipes/categories/:id',
    name: 'RecipesCategory',
    component: () => import(/* webpackChunkName: "recipesCategory" */ '../views/RecipesCategory.vue')
  },
  {
    path: '/recipes/categories/mainingredient/:id',
    name: 'RecipesCategoryMainIngredient',
    component: () => import(/* webpackChunkName: "recipesCategoryMainIngredient" */ '../views/RecipesCategoryMainIngredient.vue')
  },
  {
    path: '/recipes/:id',
    name: 'SingleRecipe',
    props: true,
    component: () => import(/* webpackChunkName: "singleRecipe" */'../views/SingleRecipe.vue')
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import(/* webpackChunkName: "loginPage" */'../views/LoginPage.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "user" */ '../views/UserPanel.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/addrecipe',
    name: 'AddRecipe',
    component: () => import(/* webpackChunkName: "addrecipe" */ '../views/AddNewRecipe'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/changerecipe/:id',
    name: 'ChangeRecipe',
    component: () => import(/* webpackChunkName: "changerecipe" */ '../views/AdminPanelChangeRecipe.vue'),
    meta: {
        requiresAdmin: true
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/AdminPanel.vue'),
    meta: {
        requiresAdmin: true
    },
    redirect: '/admin/addingredient',
    children: [
      {
        path: '/admin/changeingredient',
        name: 'ChangeIngredient',
        component: () => import(/* webpackChunkName: "changeingredient" */ '../views/AdminPanelChangeIngredient.vue'),
        meta: {
            requiresAdmin: true
        }
      },
      {
        path: '/admin/checkcomments',
        name: 'CheckComments',
        component: () => import(/* webpackChunkName: "checkcomments" */ '../views/AdminPanelCheckComments.vue'),
        meta: {
            requiresAdmin: true
        }
      },
      {
        path: "/admin/addingredient",
        name: "AddIngredient",
        component: () => import(/* webpackChunkName: "addingredient" */'../views/AdminPanelAddIngredient.vue'),
        meta: {
            requiresAdmin: true
        }
      },
      {
        path: "/admin/recipereports",
        name: "RecipeReports",
        component: () => import(/* webpackChunkName: "recipereports" */'../views/AdminPanelRecipeReports.vue'),
        meta: {
            requiresAdmin: true
        }
      },
      {
        path: '/admin/userlist',
        name: 'UserList',
        component: () => import(/* webpackChunkName: "userList" */ '../views/AdminPanelUserList.vue'),
        meta: {
            requiresAdmin: true
        }
      },
      {
        path: '/admin/categories',
        name: 'EditCategories',
        component: () => import(/* webpackChunkName: "editCategories" */ '../views/AdminPanelEditCategories.vue')
      }
    ]
  },
  {
    path: "/404",
    alias: "*",
    name: "notFound",
    component: () => import(/* webpackChunkName: "notFound" */'../views/NotFound.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    let loggedUser = sessionStorage.getItem('sid')
    if(loggedUser){
      axios.get('http://108m122.e2.mars-hosting.com/api/check-session',{
        params:{
          sid: sessionStorage.getItem("sid")
        }
      })
      .then((res)=>{
        if(res.data.res === "ok"){
          let user = res.data.user
          let currentUser = new User(user.usr_id, user.usr_username, user.usr_fullname, user.usr_email, user.img_link, user.usr_level, user.usr_banned, user.allergies, user.preferences)
          if(!user.img_link){
            currentUser.imgLink = "/genericimguser.jpg"
          }
          store.dispatch('login', currentUser)
          if ( store.state.currentUser.userId !== null ) {
            next()
          }
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    }else{
      next({ name: "LoginPage" }) 
    }
  } 
  
  if (to.meta.requiresAdmin) {
    let loggedUser = sessionStorage.getItem('sid')
    if(loggedUser){
      axios.get('http://108m122.e2.mars-hosting.com/api/check-session',{
        params:{
          sid: sessionStorage.getItem("sid")
        }
      })
      .then((res)=>{
        if(res.data.res === "ok"){
          let user = res.data.user
          let currentUser = new User(user.usr_id, user.usr_username, user.usr_fullname, user.usr_email, user.img_link, user.usr_level, user.usr_banned, user.allergies, user.preferences)
          store.dispatch('login', currentUser)
          if ( store.state.currentUser.userId !== null && store.state.currentUser.level === 1 ) {
            next()
          }
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    }else{
      next({ name: "LoginPage" }) 
    }
  } else {
      next()
}

})
export default router