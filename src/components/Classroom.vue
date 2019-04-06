<template>
    <div>
        <h1>Welcome to the Classroom</h1>
        <div id="main">
            <Canvas v-bind:broadcasting="broadcasting"
                    clientType="clientType" :canvasCallback="canvasCallback"></Canvas>
            <ChatBox :socket="socket" :username="username"></ChatBox>
            <!-- <StudentDash v-on:requestAcc="requestAccess" :socket="socket" v-if="clientType==='student'" :broadcasting="broadcasting"></StudentDash>--> 
            <!-- <TeacherDash v-on:grantReq="grantReq($event)" :socket="socket"
            v-else :broadcasting="broadcasting" :requestActive="requestActive"></TeacherDash> -->
        </div>
    </div>
</template>

<script>
import { TeacherNode, RTCNode }  from '../rtc.js'
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
    props: ["clientType", "canvas", "roomID", "roomName", "username"],
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
              this.rtc = new TeacherNode(canvas, video);
              this.socket = this.rtc.socket;
              this.rtc.socket.checkWS().then(() => {
                this.rtc.socket.sendMessage({ type: "createRoom", roomName: this.roomName });
                console.log("sent create room req", this.roomName);
              })
              .catch(err => console.log("Unable to create classroom -- ws uninitialized", err));
            }
            else if (this.clientType === "student") {
              this.rtc = new RTCNode(video);
              this.socket = this.rtc.socket;
              this.rtc.socket.checkWS().then(() => {
                this.rtc.socket.sendMessage({ 
                  type: "joinRoom",
                  roomName: this.roomID,
                })
              })
              .catch(err => console.log("Unable to join classroom -- ", err));
            }
            else {
              throw "Unknown client type: " + this.clientType;
            }
          },
        requestAccess() {
          postData("/reqbroadcast", {
            cid: this.rtc.clientID,
          }).then(json => {})
          .catch(err => console.log("err requsting access", err));
        },
        grantReq(cid) {
          console.log("cid = ", cid);
          this.socket.sendMessage( {
            type: "grantBroadcast",
            pid: this.rtc.clientID,
            cid: cid,
          })
        }
    }
}
</script>