<template>
    <div class="recipe-categories">
        <h3>Choose categories for your recipe: </h3>
        <p>Those with asterisks (<span class="red-font">*</span>) are required</p>
        <div class="recipe-categorie">
            <p><span class="red-font">*</span>Main ingredient:</p>
            <select v-model="mainIngredient"  @change="handleMainIngredient">
                <option v-for="(mainIng, index) in mainIngredients" :key="index"> {{mainIng.itp_name}} </option>
            </select>
        </div>
        <div class="recipe-categorie">
            <p><span class="red-font">*</span>Meal type:</p>
            <select v-model="singleMeal" @change="handleMealType">
                <option v-for="(meal, index) in mealTypes" :key="index" :value="meal.rct_name"> {{meal.rct_name}} </option>
            </select>
            <!-- <p>Choose meal type:</p>
            <span v-for="(meal, index) in mealTypes" :key="index">
                {{meal.rct_name}} 
                <input type="checkbox" @change="handleMealType(meal.rct_name)">
            </span> -->
        </div>
        <div class="recipe-categorie">
            <p><span class="red-font">*</span>Course:</p>
            <select v-model="singleCourse"  @change="handleCourseType">
                <option v-for="(course, index) in courses" :key="index" :value="course.courseName"> {{course.courseName}} </option>
            </select>
        </div>
        <div class="recipe-categorie">
            <p>Country: </p>
            <select v-model="singleCountry"  @change="handleCountry">
                <option value="Empty">Empty</option>
                <option v-for="(country, index) in countries" :key="index" :value="country.rct_name"> {{country.rct_name}} </option>
            </select>
        </div>
        <div class="recipe-categorie">
            <p>Diet type: </p>
            <span class="diets" v-for="(diet, index) in diets" :key="index">
                {{diet.dietName}} 
                <input type="checkbox" @change="handleDietType(diet.dietName)">
            </span>
        </div>
    </div>
</template>

<script>
export default {
    props:[
        'mealTypes', 
        'courses', 
        'countries', 
        'diets',
        'mainIngredients'
    ],
    data(){
        return{
            singleMeal: "",
            singleCountry: "",
            singleDiet: "",
            singleCourse: "",
            mainIngredient: ""
        }
    },
    methods:{
        handleMealType(){
            this.$emit("handleMealType", this.singleMeal)
        },
        handleCourseType(){
            this.$emit("handleCourseType", this.singleCourse)
        },
        handleCountry(){
            this.$emit("handleCountry", this.singleCountry)
        },
        handleDietType(diet){
            this.$emit("handleDietType", diet)
        },
        handleMainIngredient(){
            this.$emit("handleMainIngredient", this.mainIngredient)
        }
    }
}
</script>

<style>
    .recipe-categories{
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    h3,p  {
        width: 95%;
    }

    p {
        margin-top: 0px;
    }
    .recipe-categorie{
        margin: 5px;
        border: 1px solid #000;
        padding: 10px;
        flex-grow: 2;
    }

    .recipe-categorie p {
        font-weight: 700;
    }

    .diets{
        display: block;
    }
    /* .recipe-categorie span{
        display: flex;
        justify-content: center;
    } */
    
    @media screen and (max-width: 1279px) {
        .recipe-categories{
            flex-direction: column;
        }
    }
</style>