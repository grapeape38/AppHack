<template>
  <div id="app">
    <SplashForm/>
    <div v-if="clientType === none"> </div>
  </div>
</template>

<script>
import SplashForm from './components/SplashForm.vue'
export default {
  name: 'app',
  components: {
   SplashForm 
  }
}
</script>


<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
