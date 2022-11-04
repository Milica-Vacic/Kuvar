<template>
    <div class="login">
            <div class="background-img-recipes"></div>
            <transition name="fade" mode="out-in">
                <the-login :passwordType="passwordType" :logIn="logIn" @handleLogin="handleLogin" @handleRegister="handleRegister" @togglePassword="togglePassword" />
            </transition>
            <transition name="fade" mode="out-in">
                <the-register :passwordType="passwordType" :showRegister="showRegister" @showLogin="showLogin" @handleRegisterUser="handleRegisterUser" @togglePassword="togglePassword" />
            </transition>
        <transition name="fade" mode="out-in">    
            <h2 class="error-msg"><span>{{errMsg}}</span></h2>
        </transition>
  </div>
</template>

<script>
import User from '../javascript/User'
import axios from 'axios'
import TheLogin from '../components/LoginPanel/TheLogin'
import TheRegister from '../components/LoginPanel/TheRegister'


export default {
    components:{
        TheLogin,
        TheRegister
    },
    data(){
        return{
            logIn: true,
            showRegister: false,
            currentUser: {},
            sid: "",
            errMsg: "",
            passwordType: true
        }
    },
    methods:{
        showLogin(){
            this.showRegister = false
            this.logIn = true
        },
        handleRegister(){
            this.showRegister = true
            this.logIn = false
        },
        handleRegisterUser(user){
            if(user.password != user.repeatPassword){
                this.errMsg = "Passwords don't match"
                setTimeout(()=>{
                    this.errMsg = ""
                }, 3500)
                return;
            }
            axios.post("http://108m122.e2.mars-hosting.com/api/user", {
                username: user.username,
                email: user.email,
                pass: user.password,
                pass2: user.repeatPassword,
                fullname: user.fullname
            })
            .then((res)=>{
                if(res.data.res == "ok"){
                    this.handleLogin(user)
                }
                if(res.data.res == "err"){
                    this.errMsg = res.data.msg
                    setTimeout(()=>{
                        this.errMsg = ""
                    }, 3500)
                }
            }).catch((err)=>{
                console.log(err);
            });
        },
        handleLogin(user){
            axios.post("http://108m122.e2.mars-hosting.com/api/login", {
                name: user.username,
                pass: user.password
            })
            .then((res)=>{
                if(res.data.res === "ok"){
                    axios.get("http://108m122.e2.mars-hosting.com/api/user/" + res.data.usrId)
                    .then((res)=>{
                        let user = res.data.user;
                        this.currentUser = new User(user.usr_id, user.usr_username, user.usr_fullname, user.usr_email, user.img_link, user.usr_level, user.usr_banned, user.allergies, user.preferences)
                        if(!user.img_link){
                            this.currentUser.imgLink = "/genericimguser.jpg"
                        }
                        this.$store.dispatch('login', this.currentUser)
                        this.logName = ""
                        this.password = ""
                        this.logIn = false
                        this.$router.go(-1)
                        console.log(this.currentUser)
                        })
                        .catch((ex)=>{
                            console.error(ex)
                        })
                        this.sid = res.data.sid
                        sessionStorage.setItem("sid", this.sid)
                }
                if(res.data.res === "err"){
                    this.errMsg = res.data.msg
                    setTimeout(()=>{
                        this.errMsg = ""
                    }, 3500)
                }
                
            }).catch((err)=>{
                console.error(err)
            });
        },
        togglePassword(){
            this.passwordType = !this.passwordType
        }
    }
}
</script>

<style>
    .login{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 100vh;
    }
    .error-msg{
        color: rgb(255, 0, 0);
    }
    .background-img-recipes{
        position: fixed;
        width: 100%;
        height: 100%;
        background-image: url("../assets/backimg.jpg");
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


</style>