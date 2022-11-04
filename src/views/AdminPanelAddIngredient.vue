<template>
  <add-ingredient @handleSubmitIngredient="handleSubmitIngredient" @handleAddIngredientImg="handleAddIngredientImg" :imgUrl="imgUrl" :err="emptyField" />
</template>

<script>
import AddIngredient from '../components/AdminPanel/AddIngredient'
import axios from 'axios'
export default {
    components:{
        AddIngredient
    },

    data(){
        return{
            emptyField: "",
            ingredientImg: null,
            imgUrl: ""
        }
    },
    methods:{
        handleSubmitIngredient(ing){
            if(ing.ingName.length <= 3 || this.ingredientImg === null){
                this.emptyField = "Fill in all the fields correctly.."
                setTimeout(() => {
                    this.emptyField = ""
                }, 2000);
                return
            }
            if(isNaN(ing.ingCal)){
                console.log(!isNaN(ing.ingCal))
                this.emptyField = "Callories must be a number.."
                setTimeout(() => {
                    this.emptyField = ""
                }, 2000);
                return
            }
            let formData = new FormData();
                formData.append('sid', sessionStorage.getItem("sid"))
                formData.append('img', this.ingredientImg)
                formData.append('name', ing.ingName)
                formData.append('cal', ing.ingCal)
                if(ing.ingDens.length > 1 || !isNaN(ing.ingDens)){
                    formData.append('density', ing.ingDens)
                }else{
                    formData.append('density', null)
                }
            axios.post("http://108m122.e2.mars-hosting.com/api/ingredient", formData, {
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.8',
                    'Content-Type': `multipart/form-data;`
                }
            })
            .then((res)=>{
                if(res.data.res === 'ok'){
                    this.ingredientImg = null
                    this.imgUrl = ""
                }
            })
            .catch((ex)=>{
                console.error(ex)
            })
        },
        handleAddIngredientImg(e){
            let width = 250;
            let fileName = e.target.files[0].name
            let reader = new FileReader();
            reader.readAsDataURL(e.target.files[0])
            reader.onload = event => {
                let img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    let elem = document.createElement('canvas')
                    elem.width = width;
                    let scaleFactor = width / img.width
                    elem.height = img.height * scaleFactor
                    let ctx = elem.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, img.height * scaleFactor)
                    ctx.canvas.toBlob((blob) => {
                        let file = new File([blob], fileName, {
                            type: 'image/',
                            lastModified: Date.now()
                        });
                        if(e.target.files[0].size < file.size){
                            this.ingredientImg = e.target.files[0]
                        }else{
                            this.ingredientImg  = file
                        }
                        this.imgUrl = URL.createObjectURL(file)
                    }, 'image/jpeg', 1)

                },
                reader.onerror = error => console.log(error)
                }
        }
    }

}
</script>


<style>

</style>