<template>
  <div class="nav-top-margine">
    <div class="home"></div>
    <home-page />
    <footer-bottom/>
  </div>
</template>

<script>
// @ is an alias to /src
import HomePage from '@/components/HomePage.vue'
import FooterBottom from '@/components/FooterBottom'

export default {
  name: 'Home',
  components: {
    HomePage,
    FooterBottom
  },
  data(){
    return{
    }
  }
}
</script>

<style scoped>
.home{
  position: fixed;
  width: 100%;
  height: 100%;
  background-image: url("../assets/front-knife.jpg");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  z-index: -1;
}
@media screen and (max-width: 768px) {
  .home {
    margin: 0 auto !important;
  }
  .nav-top-margine{
    margin: 0 auto;
  }
}
</style>
