/* eslint-disable */
import { ClientSocket } from './client-socket.js'
import './simplepeer.min.js'

class RTCNode {
  constructor(vid) {
    this.stream = null;
    this.socket = new ClientSocket(this);
    this.outgoingRTC = new Map(); 
    this.incomingRTC = null; // single SimplePeer connection 
    this.vid = vid;
    console.log("rtc vid = ", vid);
  }

  get clientID() {
    if (this._clientID == undefined) throw "Undefined client id";
    return this._clientID;
  }

  get clientId() { throw "Id typo"; }

  set clientID(id) {
    this._clientID = id;
  }

  /** RTCNode.createSourceRTC
   *    create initiator connection and add to
   *    map of outgoing connections
   */
  createSourceRTC(childID) {
    if (this.stream == undefined) 
      throw "Cannot create source RTC -- stream undefined";

    var rtc = new SimplePeer({
      initiator: true,
      stream: this.stream,
      trickle: false,
    });
    rtc.on("connect", () => {
      // handshake completed
      console.log("connected!");
    });

    // offer signal fires when initiator is instantiated
    // answer must be signaled to complete handshake
    rtc.on("signal", data => {
      if (data.type == "offer") {
        // send to server so it can forward to connecting client
        this.socket.sendMessage({
          type: "presentOffer",
          offer: data,
          pid: this.clientID,
          cid: childID,
        });
      }
    });
    
    // update map
    this.outgoingRTC.set(childID, rtc);
  }

  createReceiverRTC(offer) {
    if (offer == undefined) 
      throw "Cannot create receiver RTC node -- offer undefined";
    var rtc = new SimplePeer({ trickle : false});

    rtc.on("signal", data => {
      if (data.type == "answer") {
        console.log("sending answer");
        this.socket.sendMessage({ 
          type: "presentAnswer",
          answer: data,
          pid: this.parentID,
          cid: this.clientID,
        });
      }
    });

    // fire offer signal to start ICE negotiation
    rtc.signal(offer);

    rtc.on("data", data => console.log("rtc (data) msg from parent: " , JSON.parse(data)));

    rtc.on("stream", remoteStream => {
      console.log("getting stream");
      // update video src also
      this.vid.srcObject = remoteStream;
      this.vid.play();
      console.log("update vsrc ", this.vid.srcObject);
      this.stream = remoteStream; 
      // also add stream to each child if need to propagate new stream
      this.outgoingRTC.forEach(childRTC => {
        childRTC.addStream(remoteStream);
      });
    });
    return rtc;
  }

  destroyIncoming() {
    this.incomingRTC.destroy();
  }

  destroyOutgoing(cid) {
    var childRTC = this.outgoingRTC.get(cid);
    if (childRTC == null) throw "cannot break connection with unknown child" + cid;
    childRTC.destroy();
    this.outgoingRTC.delete(cid);
  }
}

class TeacherNode extends RTCNode {
  constructor(canvas, vid) {
    super(vid);
    if (canvas == undefined) throw "Must supply canvas parameter";
    this.canvas = canvas;
    this.canvas.getContext("2d");  // get context once to avoid NS_UNAVAILABLE_ERROR
    this.stream = this.canvas.captureStream();
  }
  /** Teacher.createReceiverRTC
   *    used to allow student to stream to class
   */ 
  createReceiverRTC(offer) {
    this.ogStream = this.stream;
    return super.createReceiverRTC(offer);
  }

  destroyIncoming() {}
}

export {
  TeacherNode as TeacherNode,
  RTCNode as RTCNode,
};