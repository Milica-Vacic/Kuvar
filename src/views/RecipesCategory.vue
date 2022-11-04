<template>
  <div class="nav-top-margine recipes-category">
        <div class="background-img-recipes"></div>
        <nav>
        <h2>{{cat}}</h2>
        </nav>
        <the-recipe v-if="!msg" @reportRecipe="reportRecipe" @clicked="setSort" :sort="sort" :currentUser="currentUser" :recipes="recipes" @goToSingleRecipe="goToSingleRecipe"  />
        <button v-if="moreRecipes" @click="showMore">Show more</button>
        <h3> {{msg}} </h3>
        <pop-up-modal :msg="modalMsg" :openModal="openModal" @closeModal="closeModal"/>
  </div>
</template>

<script>
import axios from 'axios'
import Recipe from '../javascript/Recipe'
import TheRecipe from '../components/TheRecipe'
import PopUpModal from '../components/PopUpModal' 
import { mapState } from 'vuex'

export default {
    components:{
        TheRecipe,
        PopUpModal
    },
    data(){
        return{
            recipes: [],
            msg: null,
            sort:'trending',
            cat:'',
            modalMsg: "",
            openModal: false,
            limitOffset: 0,
            limitBtn: 10,
            limitRecipes: null,
            moreRecipes: true
        }
    },
    computed: {
        catId() {
            let prefs = []
            prefs.push(this.$route.params.id)
            if (this.currentUser.prefs==null) return JSON.stringify(prefs)
            for (let pref of this.currentUser.prefs){
                prefs.push(pref)
            }
            return JSON.stringify(prefs)
        },
        ...mapState(['currentUser'])
    },
    methods:{
        fetchRecipesByCategory(val){
            if(val){
                this.recipes = []
                this.limitOffset = 0
                this.moreRecipes = true
            }
            axios.get("http://108m122.e2.mars-hosting.com/api/recipes",{
                params:{
                    cat_id: this.catId,
                    allergies:JSON.stringify(this.currentUser.allergies),
                    sort:this.sort,
                    limit: this.limitBtn,
                    limitOffset: this.limitOffset
                }
            })
            .then((res)=>{ 
                if(res.data.res === 'err'){
                    console.log('errrrrrrrrrrrrrrrr', res.data)
                    this.moreRecipes = false
                    return
                }
                this.limitRecipes = res.data.recCount[0].recCount
                if(res.data.res === 'ok'){
                    this.msg=null
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
                }
            })
            .catch(function (ex) {
                console.log('Request canceled', ex)
            });
        },
        goToSingleRecipe(recId){
            this.$router.push("/recipes/" + recId)
        },
        setSort(val){
            this.sort=val
            this.fetchRecipesByCategory(val)
        },
        getCatName(){
            axios.get("http://108m122.e2.mars-hosting.com/api/categories",{
                params:{
                    cat_ids: this.$route.params.id
                }
            })
            .then((res)=>{
                if (res.data.res==='ok'){
                    this.cat=res.data.data[0].rct_name
                }
                else{
                    this.cat=res.data.msg
                }
            })
            .catch((ex)=>{
                console.error(ex)
            })
        },
        reportRecipe (rec) {
            this.recipes[rec.idx].recRepVal = true
            axios.post("http://108m122.e2.mars-hosting.com/api/reports", {
                sid: sessionStorage.getItem("sid"),
                rec_id: rec.recId
            })
            .then((res)=>{
                console.log(res.data)
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
        closeModal(){
            this.openModal = false
        },
        showMore () {
            this.limitOffset += this.limitBtn
            this.fetchRecipesByCategory()
        }
    },
    watch:{
        catId(newVal){
            if(newVal){
                this.getCatName()
                this.fetchRecipesByCategory(newVal)
            }
        }
    },
    mounted(){
        this.fetchRecipesByCategory()
        this.getCatName()
    }
}
</script>

<style scoped>
nav {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fab32f71;
    margin: 30px 0px;
    width: 100%;
}
.recipes-category{
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
    min-height: 130vh;
    filter: blur(2px);
    -webkit-filter: blur(1px);
    -moz-filter: blur(1px);
    -o-filter: blur(1px);
    -ms-filter: blur(1px);
    z-index: -1;
}

@media screen and (max-width: 768px){
    .recipes-category{
        margin: 0 auto;
    }
    nav{
        margin: 0;
    }
}
</style>