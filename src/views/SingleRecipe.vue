<template>
  <div class="single-recipe" v-if="recipe">
      <h2> {{recipe.rec_name}} 
        <button v-if="currentUser.level!=null && currentUser.level<2" @click="$router.push({name:'ChangeRecipe', params:{id: recipe.rec_id} })">Change recipe</button> 
        <button v-if="currentUser.level!=null && currentUser.level<2" @click="deleteRecipe">Delete recipe</button> 
      </h2> 
      <div class="upperWrap">
        <div class="recipe-images">
          <div v-if="recipe.img_links" class="single-recipe-img">
            <img :src="recipeMainImg" :alt="recipe.rec_name">
          </div>
          <div v-if="recipe.img_links.length > 1" class="single-recipe-imgs">
              <img @click="recipeMainImg = img" v-for="img in recipe.img_links" :key="img" :src="img" :alt="recipe.rec_name">
          </div>
        </div>
        <div class="briefInfo">
          <span class="go-back">
            <button @click="goBack">Back</button>
          </span>
          <p>Author: {{recipe.usr_fullname}}</p>
          <p>Cooking time: {{recipe.rec_preptime}} min</p>
          <p v-if="recipe.diets && recipe.diets.length>0">Diets:
              <span v-for="(diet,index) in recipe.diets" :key="index">
                {{diet+(index===recipe.diets.length-1?'':',')}}
              </span>
          </p>
          <p>Main ingredient: {{recipe.itp_name}}</p>
          <p>Course: {{recipe.course[0]}}</p>
          <p>Meal type: {{recipe.meal_type[0]}}</p>
          <p>Calories per 100g: {{Math.round(recipe.calories*100)/100}}</p>
          <p v-if="recipe.rating">Rating: <recipe-rating @handleRecipeRating="handleRecipeRating" :starChecked="sumRating"/> {{recipe.rating.toFixed(2)}}</p>
          <p v-if="currentUser.userId != null && !disableRating">Rate: <recipe-rating @handleRecipeRating="handleRecipeRating" :starChecked="null" :disableRating="disableRating" /> </p>
          <button :style="showReport ? 'background: #00000070; cursor: auto' : ''" v-if="currentUser.userId != null && currentUser.level === 2" :disabled="showReport" @click="reportRecipe"><i class="fa fa-flag"></i>  Report</button>
        </div>
      </div>
      <div id="middleWrap">
        <div class="ingredientss">
          <table>
            <tr>
              <th><h4>Ingredients:</h4></th>
            </tr>
            <tr v-for="ingredient in recipe.ingredients" :key="ingredient.ing_name">
              <td>
                {{ingredient.ing_name}} - {{ingredient.rci_amount}} {{ingredient.uni_name}}
                <button @click="showMore(ingredient.ing_name)">Convert</button>
                <div  v-if="isShowing.includes(ingredient.ing_name)" >
                  <div v-for="(unit,index) in ingredient.units" :key=index>
                    <span v-if="unit[0]!=ingredient.uni_name">{{unit[0]}}: {{Math.round( ingredient.grams/unit[1]/(ingredient.ing_g_mer_ml!=null?ingredient.ing_g_mer_ml:1)*100)/100}}</span>
                  </div>
                </div>

              </td>
            </tr>
          </table>
        </div>
        <div class="steps">
          <table v-if="recipe.steps">
            <tr>
              <th colspan="2"><h4>Steps:</h4></th>
            </tr>
            <tr v-for="step in recipe.steps" :key="step.ste_description">
              <td>{{step.ste_number}}. {{step.ste_description}}</td>
            </tr>
          </table>
        </div>
      </div>
      <the-comments class="comments" @sendComment="sendComment" @deleteComment="deleteComment" :currentUser="currentUser" :comments="comments" @reportComment="reportComment"  />
      <pop-up-modal :msg="modalMsg" :openModal="openModal" @closeModal="closeModal"/>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import RecipeRating from '../components/RecipeRating' 
import PopUpModal from '../components/PopUpModal' 
import TheComments from '../components/TheComments'
import Comment from '../javascript/Comment'

export default {
  data(){
    return{
      recipe: null,
      recipeMainImg: null,
      comments: [],
      showReport: false,
      modalMsg: "",
      openModal: false,
      disableRating: false,
      isShowing:[]
    }
  },
  components:{
    RecipeRating,
    TheComments,
    PopUpModal
  },
  computed:{
    ...mapState(['currentUser']),
    sumRating(){
      return Math.round(this.recipe.rating)
    }
  },
  methods:{
    getSingleRecipe(id) {
        this.fetchRecipes(id)
    },
    fetchRecipes(id){
      axios.get("http://108m122.e2.mars-hosting.com/api/recipes/" + id)
      .then((res)=>{  
        this.recipe = res.data.data[0]
        if(!this.recipe.img_links){
          this.recipe.img_links = []
          this.recipe.img_links.push("/genericimg.jpg")
        }
        this.recipeMainImg = this.recipe.img_links[0]
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    goBack(){
      return this.$router.go(-1);
    },
    handleRecipeRating(recipeRating){
      axios.post('http://108m122.e2.mars-hosting.com/api/ratings',{
        sid: sessionStorage.getItem('sid'),
        rec_id: this.recipe.rec_id,
        rating: recipeRating
      })
      .then((res)=>{
        if(res.data.res === 'ok'){
          this.getSingleRecipe(this.$route.params.id)
          this.disableRating = true
        }else{
          console.log(res)
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    sendComment(msg){
      axios.post("http://108m122.e2.mars-hosting.com/api/comments",{
        sid: sessionStorage.getItem("sid"),
        rec_id: this.recipe.rec_id,
        msg: msg
      })
      .then((res)=>{
        if(res.data.res === 'ok'){
          this.fetchComments(this.$route.params.id)
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    fetchComments(recId){
      this.comments = []
      axios.get("http://108m122.e2.mars-hosting.com/api/comments",{
        params:{
          rec_id: recId
        }
      })
      .then((res)=>{
        let comments = res.data.data
        if(res.data.res === 'ok'){
          for(let i = 0; i < comments.length; i++){
            this.comments.push(new Comment(
              comments[i].com_id,
              comments[i].com_content,
              comments[i].usr_id,
              comments[i].rec_id,
              comments[i].usr_fullname,
              comments[i].img_link
            ))
          }
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    deleteComment(comId){
      axios.delete("http://108m122.e2.mars-hosting.com/api/comments/" + comId, {
        params:{
          sid: sessionStorage.getItem("sid")
        }
      })
      .then((res)=>{
        if(res.data.res === 'ok'){
          this.fetchComments(this.$route.params.id)
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    reportComment(rep){
      axios.post("http://108m122.e2.mars-hosting.com/api/reports",{
        sid: sessionStorage.getItem("sid"),
        com_id: rep.comId,
        msg: rep.repMsg
      })
      .then((res)=>{
        if(res.data.res === "ok"){
          this.comments[rep.idx].reportPanel = false
          this.comments[rep.idx].reportMsg = ""
        }
        if(res.data.res === "err"){
          this.modalMsg = res.data.msg
          this.openModal = true
          this.comments[rep.idx].reportPanel = false
          this.comments[rep.idx].reportMsg = ""
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    reportRecipe(){
      this.showReport = true;
      axios.post("http://108m122.e2.mars-hosting.com/api/reports", {
        sid: sessionStorage.getItem("sid"),
        rec_id: this.recipe.rec_id
      })
      .then((res)=>{
        if(res.data.res === "err"){
          this.modalMsg = res.data.msg
          this.openModal = true
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    },
    closeModal(){
      this.openModal = false
    },
    showMore(name){
      if (this.isShowing.includes(name)){
        this.isShowing.splice(this.isShowing.indexOf(name),1)
      }
      else this.isShowing.push(name)
    },
    deleteRecipe(){
      axios.delete('http://108m122.e2.mars-hosting.com/api/recipes/' + this.recipe.rec_id, {
        params:{
          sid: sessionStorage.getItem('sid'),
        }
      })
      .then((res)=>{
        console.log(res)
        if(res.data.res === 'ok'){
          this.$router.push("/recipes")
        }
      })
      .catch((ex)=>{
        console.error(ex)
      })
    }
  },
  mounted(){
    this.getSingleRecipe(this.$route.params.id)
    this.fetchComments(this.$route.params.id)
  }
}
</script>

<style>
  .single-recipe{
    width: 80%;
    margin: 85px auto;
    font-size: 1.4rem;
  }

.steps, .ingredientss {
  max-height: 75vh;
  overflow-y: auto;
  flex-grow: 2;
  margin: auto;
}

.ingredientss table, .steps table{
  width: 90%;
  margin: 10px 20px;
  box-sizing: border-box;
}

#middleWrap {
  margin: 40px 5px;
  padding: 10px 0px;
}

#middleWrap h4 {
  margin-top: 0px;
}

  .single-recipe img{
    width: 100%;
    border-radius: 15px;
  }
  .single-recipe > div{
    display: flex;
    justify-content: space-evenly;
  }


  .single-recipe table{
    border-collapse: collapse;
  }
  .single-recipe td{
    width: 400px;
    padding: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.486);
    text-align: left;
  }
  .recipe-images{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 55%;
  }
  .single-recipe-img{
    display: flex;
    width: 100%;
    height: 50vh;
  }
  .single-recipe-img img{
    object-fit: cover;
  }
  .single-recipe-imgs{
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }
  .single-recipe-imgs img{
    max-width: 25%;
    max-height: 50%;
    margin: 5px 5px 0 0;
    object-fit: cover;
    opacity: 0.8; 
    cursor: pointer; 
  }
  .single-recipe-imgs img:hover{
    opacity: 1;
  }
  .single-recipe .fa-star{
    color: orange;
  }
  @media screen and (max-width:1360px) {
    #middleWrap {
      display: flex;
      flex-direction: column;
    }

    .steps, .ingredientss {
      width: 90%;
      max-height: none;
      overflow: hidden
    }

    .single-recipe td {
      text-align: center;
    }


  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    .single-recipe {
      width: 95%;
    }
    .comments {
      width: 550px;
    }
  }
  @media screen and (max-width: 768px) {
    .single-recipe > div{
      flex-direction: column;
      align-content: center;
    }
     .recipe-images{
       width: 90%;
     }
  }
@media screen and (max-width: 768px) {
    .comments{
        overflow: auto;
        height: auto;
        width: 90%;
    }
    .comment button{
        position: relative;
    }
    
}

.upperWrap {
padding: 5% 0px;
border-bottom:solid rgba(0, 0, 0, 0.486) 1px ;
}

button {
  font-size: 1.2rem;
}

.comments{
  width: 90%;
}
</style>