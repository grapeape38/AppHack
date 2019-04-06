<template>
  <div class="mainblock">
  <div v-if="error !== ''" id="gotoRoom">
  <h3>Error: {{error}}</h3>
  <b-button v-on:click="error=''">Go Back</b-button>
  </div>
  <span class="formdiv" v-else>
  <div class="header">
  <b-nav pills>
  <b-nav-item v-on:click="activeTab=1" v-bind:active="activeTab === 1">Teacher</b-nav-item>
  <b-nav-item v-on:click="activeTab=2" v-bind:active="activeTab === 2">Student</b-nav-item>
  </b-nav>
  </div>
  <form v-if="activeTab === 1" id="createRoom">
  <b-form-input id="roomName" v-model="roomName" placeholder="Classroom Name"></b-form-input>
  <b-button v-on:click="createRoom" id="submit">Create Classroom!</b-button>
  </form>
  <form v-else id="joinRoom">
    <b-form-input id="roomID" v-model="roomID" placeholder="Classroom ID"></b-form-input>
    <b-form-input id="username" v-model="username" placeholder="Username"></b-form-input>
    <b-button v-on:click="joinRoom" id="submit">Join Room</b-button>
  </form>
  </span>
  </div>
  </template>
<style scoped>
.formdiv {
  display: inline-block;
  min-width:300px;
}
input {
  margin: 10px;
}
.mainblock {
  /*text-align: center;*/
  margin: 0 auto 0 auto;
  width: 50%;
}
</style>
</template>

<script>
/* eslint-disable */
import { TeacherNode, RTCNode }  from '../rtc.js'
import '../jquery-3.3.1.min.js'

// tab numbers
const TEACHER = 1;
const STUDENT = 2;

// roomID used for joining
// roomName used for creating

function postData(url = ``, data = {}) {
  // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()) // parses JSON response into native Javascript objects 
    .catch(err => console.log("error with response from fetch", err));
} 

export default {
  name: 'SplashForm',
  data: function()  {
    return { 
      roomName: "",
      roomID: "",
      roomCreated: false,
      room_url: "",
      activeTab : 1 ,
      error: "",
      username: "",
      };
  },
  methods: {
    createRoom: function() {
      postData("/queryRoom", { roomName: this.roomName })
        .then(respObj => {
          if (respObj.hasRoom) {
            this.error = "Room name taken";
          }
          else {
            this.$emit('clientType', 'teacher');
            this.$emit('roomName', this.roomName);
            this.$emit("username", this.username);
          }
        })
        .catch(err => console.log("fetch error handling failed", err));
    },
    joinRoom: function() {
      postData("/queryRoom", { roomName: this.roomID })
        .then(respObj => {
          if (! respObj.hasRoom) {
            this.error = `Room '${this.roomID}' does not exist.`;
          }
          else {
            this.$emit('clientType', 'student');
            this.$emit('roomID', this.roomID);
            this.$emit("username", this.username);
          }
        })
        .catch(err => console.log("fetch error handling failed", err));
    }
  },
  props: {
  }
}
</script>