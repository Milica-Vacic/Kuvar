<template>
  <div class="recipes-wrap">
      <div class="background-img-recipes"></div>
        <nav>
          <h2>World's tastiest recipes</h2>
          <button @click="toggle">Search</button>
        </nav>
        <div>
          <search v-on:search="search" :class="{noDisp:searchToggle}" :allergiesProp="searchParams.allergies" :dietsProp="searchParams.prefs"/>
          <the-recipe @reportRecipe="reportRecipe" @clicked="setSort" :currentUser="currentUser" :recipes="recipes" :sort="sort" @goToSingleRecipe="goToSingleRecipe" class="the-recipe"/>
          <p v-text="msg"></p>
          <div :style=' !showSpiner ? "display:none" : "display:block"' class="nav-top-margine">
              <img src="/loadingimg.gif" alt="spinner">
          </div>
          <button v-if="moreRecipes" @click="showMore">Show more</button>
      </div>
      <pop-up-modal :msg="modalMsg" :openModal="openModal" @closeModal="closeModal"/>
  </div>
</template>

<script>
import axios from 'axios'
import TheRecipe from '../components/TheRecipe'
import Recipe from '../javascript/Recipe'
import search from '../components/Search'
import PopUpModal from '../components/PopUpModal'
import { mapState } from 'vuex' 
let CancelToken = axios.CancelToken
let source = CancelToken.source()

export default {
  components:{
    TheRecipe,
    search,
    PopUpModal
  },
  data(){
    return{
      recipes: [],
      sort:'trending',
      searchToggle:true,
      params:{},
      msg:'',
      modalMsg: "",
      openModal: false,
      showSpiner: false,
      limitOffset: 0,
      limitBtn: 10,
      limitRecipes: null,
      moreRecipes: true
    }
  },
  computed:{
    parameters:function(){
      let parameters = this.params
      parameters.sort = this.sort
      return parameters
    },
    searchParams:function(){
      let parameters = {}
      parameters.allergies = this.currentUser.allergies
      parameters.prefs = this.currentUser.prefs
      return parameters
    },
    ...mapState(['currentUser'])
  },
  methods:{
    fetchRecipes(val){
      if(val){
        this.recipes = []
        this.limitOffset = 0
        this.moreRecipes = true
      }
      this.params.limit = this.limitBtn
      this.params.limitOffset = this.limitOffset
      this.showSpiner = true
      axios.get("http://108m122.e2.mars-hosting.com/api/recipes",{
        params: this.parameters,
        cancelToken: source.token
      })
      .then((res)=>{
        if (res.data.res==="ok"){
          this.limitRecipes = res.data.recCount[0].recCount
          this.msg=''
          this.showSpiner = false
          let recipe = res.data.recipes
          for(let i = 0; i < recipe.length; i++){
            if(recipe[i].img_links === null){
              this.recipes.push(new Recipe(
                recipe[i].rec_id, 
                recipe[i].rec_name,
                recipe[i].rec_preptime,
                recipe[i].usr_id,
                recipe[i].itp_id,
                null,
                null,
                recipe[i].rating
              ))
              for(let j = 0; j < this.recipes.length; j++){
                if(this.recipes[j].recId === recipe[i].rec_id){
                  this.recipes[j].imgLinks.push("/genericimg.jpg")
                }
              }
            }else{ 
              this.recipes.push(new Recipe(
                recipe[i].rec_id, 
                recipe[i].rec_name,
                recipe[i].rec_preptime,
                recipe[i].usr_id,
                recipe[i].itp_id,
                null,
                null,
                recipe[i].rating
              ))
              for(let j = 0; j < this.recipes.length; j++){
                if(this.recipes[j].recId === recipe[i].rec_id){
                  this.recipes[j].imgLinks = recipe[i].img_links
                }
              }
            }
          }
          
          if(this.recipes.length >= this.limitRecipes){
            this.moreRecipes = false
          }
        }
        else {
          this.msg=res.data.msg
          this.showSpiner = false
          this.moreRecipes = false
          setTimeout(() => {
            this.msg = ""
          }, 2500);
        }
      })
      .catch(function (thrown) {
        if (axios.isCancel(thrown)) {
          console.log('Request canceled', thrown)
        } else {
          // handle error
        }
      });
    },
    goToSingleRecipe(recId){
      this.$router.push("/recipes/" + recId)
    },
    setSort(val){
      this.sort=val
      this.fetchRecipes(val)
    },
    toggle(){
      this.searchToggle=!this.searchToggle
    },
    search(val){
      this.params=val
      this.fetchRecipes(val)
    },
    reportRecipe (rec) {
      this.recipes[rec.idx].recRepVal = true
      axios.post("http://108m122.e2.mars-hosting.com/api/reports", {
        sid: sessionStorage.getItem("sid"),
        rec_id: rec.recId
      })
      .then((res)=>{
        if(res.data.res === "err"){
          this.modalMsg = res.data.msg
          this.openModal = true
        }else{
          console.log(res.data)
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    closeModal () {
      this.openModal = false
    },
    showMore () {
      this.limitOffset += this.limitBtn
      this.fetchRecipes()
    }
  },
  mounted(){
    this.params.allergies=JSON.stringify(this.currentUser.allergies)
    this.params.cat_id=JSON.stringify(this.currentUser.prefs)
    this.fetchRecipes()
  },
  watch:{
    currentUser:{
      handler: function (newVal) { 
        if(newVal){
          source.cancel()
          CancelToken = axios.CancelToken
          source = CancelToken.source()
          this.params.allergies=JSON.stringify(this.currentUser.allergies)
          this.params.cat_id=JSON.stringify(this.currentUser.prefs)
          this.fetchRecipes()
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
  .recipes-wrap{
    margin: 75px auto 0;
    padding: 0;
    min-height: 130vh;
  }
  .background-img-recipes{
    position: fixed;
    width: 100%;
    height: 100%;
    background-image: url("../assets/front-knife.jpg");
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
  }

  nav {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    background-color: #fab32f71;
    margin-bottom: 15px;
    width: 100%;
  }

  .noDisp{
    display: none;
  }
  @media screen and (max-width: 768px){
    .recipes-wrap{
      margin: 0 auto;
    }
  }
  
  
</style>