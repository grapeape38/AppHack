<template>
    <div id="dash">
        <b-form-checkbox
            id="chatEnable"
            v-model="chatEnable"
            name="chatEnable"
            value="enabled"
            unchecked-value="disabled"
        >Enable chat</b-form-checkbox>
        <b-button id="resumeCast" v-on:click="resumeCast" v-bind:class="{ hidden: broadcasting }">Become Broadcaster</b-button>
        <div v-bind:class="{ hidden: activeReq == null}">
            <label class="request">Request: {{activeReq ? activeReq.reqMsg : ''}}</label>
            <b-button v-on:click="grantReq" id="grantReq">Grant Request</b-button>
        </div>
    </div>
</template>


<script>
export default {
    name: "TeacherDash",
    props: ['broadcasting', "socket"],
    data: function() {
      return {
        chatEnable: 'enabled',
        activeReq: null
        }
    },
    watch: {
      socket(newv, old) {
        this.socket = newv;
        this.socket.addRequest = this.addRequest;
      }
    },
    methods: { 
      resumeCast() {
        this.$emit('becomeBroadcaster')
      },
      grantReq() {
        this.$emit('grantReq', this.activeReq.cid)
        this.activeReq = null
      },
      addRequest(req)  {
        this.activeReq = req;
      }
    }
}
</script>

<style scoped>
.hidden {
    display: none
}
</style>