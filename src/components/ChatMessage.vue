<template>
<li v-bind:class="{question: question}">
    <span>{{message}}</span>
</li>
</template>


<script>
export default {
    name: "ChatMessage",
    props: {
        message: "",
        question: false
    }
}
</script>

<style>
.question {
    background-color: rgb(27%, 92.5%, 27%)
}
</style>