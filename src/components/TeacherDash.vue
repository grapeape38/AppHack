<template>
    <div>
        <b-button id="resumeCast" v-bind:class="{ hidden: broadcasting }">Become Broadcaster</b-button>
        <div id="reqdiv" v-bind:class="{ hidden: !requestActive }">
            <label class="request">Request: {{reqMsg}}</label>
            <b-button v-on:click="grantReq" id="grantReq">Grant Request</b-button>
        </div>
    </div>
</template>


<script>
export default {
    name: "TeacherDash",
    props: ['broadcasting', 'requestActive', 'reqMsg', "socket"],
    watch: {
      socket(newv, old) {
        this.socket = newv;
        this.socket.setReqActive = this.setReqActive;
      }
    },
    methods: { 
      grantReq() {
        console.log("button clicked");
        this.$emit('grantReq', this.socket.rtcNode.clientID);
      },
      setReqActive(x)  {
        this.requestActive = x;
      }

    }
}
</script>

<style scoped>
.hidden {
    display: none
}

#reqdiv {
  position: absolute;
  left: 10px;
  top: 10px;
}
</style>