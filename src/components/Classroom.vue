<template>
    <div id="main">
        <div id="canvasdash">
          <Canvas v-bind:broadcasting="broadcasting"
                  clientType="clientType" :canvasCallback="canvasCallback"></Canvas>
          <StudentDash v-on:requestAcc="requestAccess" :socket="socket" v-if="clientType==='student'" :broadcasting="broadcasting"></StudentDash> 
          <TeacherDash 
          v-on:becomeBroadcaster="becomeBroadcaster"
          v-on:grantReq="grantReq($event)" :socket="socket"
          v-else :broadcasting="broadcasting"></TeacherDash>
        </div>
        <ChatBox :socket="socket" :username="username"
          :roomName="roomName"></ChatBox>
    </div>
</template>

<style>
#dash {
  height:15%;
  padding-top:10px;
}
button {
  margin: 10px;
}
#canvasdash {
  float:left;
  height:100%;
  width:70%;
}
#main {
  height: 100%;
}
</style>

<script>
import { RTCNode }  from '../rtc.js'
import Canvas from './Canvas'
import ChatBox from './ChatBox'
import StudentDash from './StudentDash'
import TeacherDash from './TeacherDash'
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
    name: "Classroom",
    props: ["clientType", "canvas", "roomName", "username"],
    data: function() {
        return { 
          broadcasting: false,
          socket: null,
        };
    },
    components: {
        Canvas,
        ChatBox,
        StudentDash,
        TeacherDash
    },
    created: function() {
        this.broadcasting = this.clientType === 'teacher'
    },
    methods: {
        canvasCallback(c, v) {
            var canvas = c
            var video = v
            console.log("created room for type: ", this.clientType, canvas, video);
            if (this.clientType === "teacher") {
              this.rtc = new RTCNode(canvas, video);
              this.socket = this.rtc.socket;
              this.rtc.socket.checkWS().then(() => {
                this.rtc.socket.sendMessage({ type: "createRoom", roomName: this.roomName });
                console.log("sent create room req", this.roomName);
              })
              .catch(err => console.log("Unable to create classroom -- ws uninitialized", err));
              this.rtc.streamCanvas()
            }
            else if (this.clientType === "student") {
              this.rtc = new RTCNode(canvas, video);
              this.socket = this.rtc.socket;
              this.rtc.socket.checkWS().then(() => {
                this.rtc.socket.sendMessage({ 
                  type: "joinRoom",
                  username: this.username,
                  roomName: this.roomName,
                })
              })
              .catch(err => console.log("Unable to join classroom -- ", err));
            }
            else {
              throw "Unknown client type: " + this.clientType;
            }
            this.rtc.socket.becomeBroadcaster = this.becomeBroadcaster
          },
        endBroadcast() {
          console.log("ending broadcast")
          this.broadcasting = false
        },
        becomeBroadcaster() {
          console.log("becoming broadcaster")
          if (!this.broadcasting) {
            this.rtc.destroyIncoming()
            this.broadcasting = true
            if (this.clientType === 'student')
              this.rtc.setTmpBroadcast(this.endBroadcast)
            this.rtc.socket.sendMessage({type: "startCast"})
            this.rtc.streamCanvas()
          }
        },
        requestAccess() {
          postData("/reqbroadcast", {
            cid: this.rtc.clientID,
          }).then(json => {})
          .catch(err => console.log("err requesting access", err));
        },
        grantReq(cid) {
          console.log("cid = ", cid);
          this.socket.sendMessage( {
            type: "grantBroadcast",
            cid: cid,
          })
          this.broadcasting = false
        }
    }
}
</script>