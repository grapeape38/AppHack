<template>
    <div>
        <b-button id="reqBtn"
            v-on:click="requestAcc"
            v-bind:class="{ hidden: broadcasting }">Request Broadcast Access</b-button>
    </div>
</template>


<script>
export default {
    name: "StudentDash",
    props: ['broadcasting', "socket"],
    watch: {
      socket(newv, old) {
        this.socket = newv;
      }
    },
    methods: {
        requestAcc() {
            this.$emit("requestAcc", this.socket.rtcNode.clientID);
        }
    }
}
</script>

<style scoped>
.hidden {
    display: none
}
</style>