<template>
<div id="chatbox">
    <b-nav tabs>
        <b-nav-item v-on:click="activeTab=1" v-bind:active="activeTab===1">Chat</b-nav-item>
        <b-nav-item v-on:click="activeTab=2" v-bind:active="activeTab===2">Participants</b-nav-item>
    </b-nav>
    <div v-if="activeTab===1">
        <ul id="chatdisplay">
            <ChatMessage
                v-for="msg in chatMessages"
                v-bind:key="msg.id"
                v-bind:message="msg.username + ': ' + msg.message"
                v-bind:question="msg.question"
            ></ChatMessage>
        </ul>
        <form v-on:submit="addChat" id="msg_form">
            <b-form-input id="msg_input" v-model="chat" placeholder="type your message"></b-form-input>
            <b-button v-on:click="addChat" id="msg_button">Post Message</b-button>
        </form>
    </div>
    <div v-else>
        <ul id="participants">
            <li
                v-for="p in participants"
                v-bind:key="p.id"
            >{{p.username}}</li>
        </ul>
    </div>
</div>
</template>

<script>

import ChatMessage from './ChatMessage'
export default {
    name: "ChatBox",
    data: function() {
        return {
            chatMessages: [],
            participants: [],
            p_loaded: false,
            activeTab: 1,
            cur_id: 0,
            chat: ""
        }
    },
    props: ["socket", "username", "roomName"],
    watch: {
      socket(newval, oldval) {
        this.socket = newval;
        this.socket.receiveChat = this.receiveChat;
        this.socket.userJoin = this.userJoin;
      },
      activeTab : function() {
          if (this.activeTab == 2 && !this.p_loaded) {
             this.p_loaded = true
             console.log("roomID", this.roomName)
            fetch('/queryRoom?roomName='+this.roomName)
            .then(function(response) {
                return response.json();
            }).then((resp) => {
                this.participants = resp.participants
            }).catch(e => 
                console.log('fetch failed', e)
            )
          }
      }
    },
    components: {
        ChatMessage
    },
    methods: {
        addChat() {
          this.socket.sendMessage({
            type: "userChat",
            text: this.chat,
            username: this.username,
          })
          /*testing
          this.receiveChat(this.chat, this.username);*/
        },
        userJoin(username, id) {
            this.participants.push({username:username, id:id});
        },
        receiveChat(text, username) { // (from server)
            var msg_obj = {
                username: username,
                message: text,
                question: text.substr(-1) === '?',
                id: this.cur_id++ 
            }
            this.chatMessages.push(msg_obj);
            var chatdisplay = document.getElementById("chatdisplay");
            chatdisplay.scrollTop = chatdisplay.scrollHeight;
        }
    }
}
</script>

<style scoped>
    div {
        height:100%;
    }
    li {
        list-style-type: none
    }
    #chatbox {
        width: 30%;
        float: right;
    }
    form, button {
        margin-top: 15px
    }
    #chatdisplay {
        height:70%;
        overflow-y: scroll;
        list-style-type: none;
    }
</style>
