<template>
    <div class="mediadiv">
        <div class="canvasdiv" v-bind:class="{ hidden: !broadcasting }">
            <div class="toolbar">
                <div id="colors">
                    <div v-for="color in colors" v-bind:style="{ background: color }"
                        v-bind:key="color"
                        v-on:click="setFGColor(color)"
                        class="colorpick"></div>
                </div>
                <label>Brush Size</label>
                <input type="range" v-on:change="setPenSize" v-model="pensize" min="5" max="30" id="pensize" class="slider"/>
                <div v-on:click="clearCanvas" style="cursor:hover" id="icondiv">
                    <i class="fa fa-trash fa-2x"></i>
                </div>
            </div>
            <canvas v-bind:ref="canvas" id="canvas"></canvas>
        </div>
        <div v-bind:class="{ hidden: broadcasting }">
            <video v-bind:ref="video" id="video"></video>
        </div>
    </div>
</template>


<script>
import CanvasDraw from '../canvas.js'
import Vue from 'vue'
import { setTimeout } from 'timers';
export default {
    name: "Canvas",
    data: function() {
        return {
            canvas: null,
            cd : null,
            video: null,
            colors: ["black", "blue", "green", "red", "yellow", "purple"],
            pensize: 5
        }
    },
    props: ['canvasCallback', 'clientType', 'broadcasting'],
    mounted: function() {
        console.log("broadcasting: ", this.broadcasting)
        var width, height
        width = canvas.clientWidth
        height = canvas.clientHeight
        this.cd = new CanvasDraw(canvas, width, height)
        this.canvasCallback(canvas, video)
    },
    watch: {
        broadcasting: function() {
            this.$nextTick(()=>
                this.cd.resize(canvas.clientWidth, canvas.clientHeight)
            )
        } 
    },
    methods: {
        setFGColor(color) {
            this.cd.setFGColor(color)
        },
        setPenSize() {
            console.log(this.pensize)
            this.cd.setPenSize(this.pensize)
        },
        clearCanvas() {
            this.cd.clearCanvas()
        }
    }
}
</script>

<style scoped>
    .mediadiv{
        height:85%;
        border: 2px solid blueviolet;
        border-radius: 5px;
    }
    .canvasdiv {
        height:100%;
    }
    .hidden {
        display: none
    }
    .colorpick {
        height:30px;
        overflow: auto
    }
    #icondiv:hover  {
        cursor: pointer 
    }
    #colors {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr
    }
    .toolbar {
        /*border: 2px solid blueviolet;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;*/
        padding: 1px;
        width: 10%;
        height:100%;
        float: left;
    }
    .slider {
        width: 100%;
        height: 10px;
        border-radius: 5px;
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
    }
    #canvas {
        border-left: 2px solid blueviolet;
        height:100%;
        width:90%;
    }
</style>
