/* eslint-disable */
const WS_OPEN = 1;

class ClientSocket {
  constructor(rtcNode) {
    this.ws = this.initWS();
    this.rtcNode = rtcNode;
    this.wsConnected = false;
  }

  initWS() {
    var ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      this.processServerMessage(event.data);
    };
    ws.onopen = (event) => { 
      console.log("WS open");
      this.wsConnected = true;
    };
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (err) => console.log("WS error:", err);
    return ws;
  }

  checkWS() {
    var checks = 0;
    return new Promise((resolve, reject) => {
      var query = setInterval(() => {
        if (this.wsConnected) {
          clearInterval(query);
          resolve();
        }
        if (checks++ > 10) reject(); 
      }, 1000);
    });
  }

  processServerMessage(msg) {
    msg = JSON.parse(msg);
    switch (msg.type) {
      case "assignID": 
        this.rtcNode.clientID = msg.clientID;
        break;
      case "childAnswer":
        this.rtcNode.outgoingRTC.get(msg.cid).signal(msg.answer);         
        break;
      case "initiateConnection":
        this.rtcNode.createSourceRTC(msg.cid);
        break;
      case "parentOffer": 
        console.log("got parent offer");
        this.rtcNode.incomingRTC = this.rtcNode.createReceiverRTC(msg.offer);
        this.rtcNode.parentID = msg.pid;
        break;
      case "breakWithParent":
        this.rtcNode.destroyIncoming();
        break;
      case "breakWithChild":
        this.rtcNode.destroyOutgoing(msg.cid);
        break; 
      case "classroomClosed":
        this.rtcNode.destroyIncoming();
        alert("Classroom has been closed");
        break;
      case "addChat":
        if (this.receiveChat == undefined) throw "Chat is uninitialized for this socket";
        this.receiveChat(msg.text, msg.username);
        break;
      case "requestBroadcast": 
        this.setReqActive(true);
        break;
      case "serverError": 
        console.log("server error: ", msg.error);
        break;
      default: throw "Unknown message type: " + msg.type;
    }
  }

  sendMessage(msgobj) {
    if (msgobj.type == undefined) throw "Cannot send message with undefined type";
    if (this.ws.readyState == WS_OPEN) {
      this.ws.send(JSON.stringify(msgobj));
      console.log("sending message to server");
    }
    else
      throw "WS error sending message to server: readyState = " + this.ws.readyState;
  }
}


export {
  ClientSocket as ClientSocket,
};