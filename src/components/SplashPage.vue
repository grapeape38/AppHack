<template>
  <div id="app">
    <SplashForm v-on:clientType="setClientType($event)" 
      v-on:roomID="setRoomID($event)" 
      v-on:roomName="setRoomName($event)" 
      v-on:username="setUsername($event)" 
      v-if="clientType === 'none'"> </SplashForm>
    <Classroom :clientType="clientType" :roomID="roomID" :roomName="roomName" :username="username" v-else></Classroom> 
  </div>
</template>

<script>
import SplashForm from './SplashForm.vue'
import Classroom from './Classroom.vue'

export default {
  name: 'app',
  data: function() {
    return {
      clientType: "none",
      roomID: "none",
      roomName: "none",
      username: "anon" + new Date().getTime(),
    }
  },
  methods: {
    setClientType(ct) {
      console.log("set ct to ", ct);
      this.clientType = ct;
    },
    setRoomName(n) {
      this.roomName = n;
    },
    setRoomID(id) {
      this.roomID = id;
    },
    setUsername(n) {
      if (n == "") return;
      this.username = n;
    }
  },
  components: {
   SplashForm,
   Classroom
  }
}
</script>


<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #5c81a7;
  margin-top: 60px;
}
</style>
