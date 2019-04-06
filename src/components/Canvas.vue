<template>
    <div>
        <div v-bind:class="{ hidden: !broadcasting }" class="canvasdiv">
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
        if (this.broadcasting) {
            this.cd = new CanvasDraw(canvas)
            this.cd.main();
        }

        this.canvasCallback(canvas, video)
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
    .canvasdiv {
        width:60%;
        float:left;
        height:500px;
    }
    .hidden {
        display: none
    }
    .colorpick {
        height:30px;
        width:30px;
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
        border-left: 2px solid blueviolet;
        border-bottom: 2px solid blueviolet;
        border-top: 2px solid blueviolet;

        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        padding: 1px;
        width:94px;
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
        border-top: 2px solid blueviolet;
        border-bottom: 2px solid blueviolet;
        border-right: 2px solid blueviolet;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        height:100%;
    }
</style>
