const express = require("express");
const session = require("client-sessions");

const secret = "as.mdfhluiayf klahfkadsf";

const WS_OPEN = 1;

const app = express();
const expressWS = require("express-ws")(app);
const bodyParser = require("body-parser");

const builddir = __dirname + "/dist";
app.use(express.static(builddir));

app.use(session({ 
  cookieName: "session",
  secret: secret,
  duration: 30 * 60 * 1000
}));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: builddir });
});

app.use(bodyParser.json());

app.post("/queryRoom", (req, res) => {
  res.status(200).json(
    { hasRoom: classrooms.has(req.body.roomName) }
  );
});

app.post("/reqbroadcast", (req, res) => {
    var cid = req.body.cid;
    var tnode = classroomSets.get(cid).root;
    console.log("broadcast rights requested by ", cid);

    var tws = clients.get(tnode.clientID);
    sendMessage(tws, {
      type: "requestBroadcast",
      cid: cid,
    })

    var checks = 0;
    return new Promise((resolve, reject) => {
      var query = setInterval(() => {
        if (tnode.allowBroadcast) {
          clearInterval(query);
          resolve();
        }
        if (checks++ > 15) reject(); 
      }, 1000);
    }).then(() => {
      res.status(200).json(
        { allowBroadcast: true }
      );
    }).catch(err => {
      res.status(200).json(
        { allowBroadcast: false }
      );
    });
});

// map client ids to ws connection object
const clients = new Map(); // map from client id to WS objects
const classrooms = new Map(); // map from class room names to PeerTree objects
const peerNodes = new Map(); // used when client leaves to access node and reconnect children
const classroomSets = new Map(); // map each participant id to peer tree object
var id = 0;

// assign client ids in increasing order
function assignClientID(clientWS) { 
  var newID = id++;
  clients.set(newID, clientWS);
  return newID;
}

app.ws("/", (ws, req) => {
  if (req.session.id == null) {
    req.session.id = assignClientID(ws);
    sendMessage(ws, { type: "assignID", clientID: req.session.id });
  }
  console.log("new client: ", req.session.id);
  
  // receive message from client
  ws.on("message", msg => processClientMessage(msg, req, ws));
  ws.on("close", () => { 
    console.log("Connection ended with client ", req.session.id);

    var tree = classroomSets.get(req.session.id);
    if (tree == null) return;
    tree.remove(peerNodes.get(req.session.id));
    clients.delete(req.session.id);
    classroomSets.delete(req.session.id);
    peerNodes.delete(req.session.id);
  });
});

app.listen(8080);
console.log("listening on port 8080");

/** ------ Websockets functions ------ **/
function error(errStr, ws) {
  console.log("Server error: ", errStr);
  if (ws && ws.readyState == WS_OPEN) 
    sendMessage(ws, {type: "serverError", error: errStr });
}


function sendMessage(ws, msgobj) {
  if (ws == null) return error("Unable to send message, ws closed");
  if (ws.readyState == WS_OPEN) 
    ws.send(JSON.stringify(msgobj));
  else
    return error("[WS SERVER => CLIENT ERROR]: WS not ready", ws);
}

// handle client message from websockets
function processClientMessage(msg, req, ws) {
  msg = JSON.parse(msg);

  switch (msg.type) {
    case "presentOffer": 
      var childWS = clients.get(msg.cid);
      if (childWS == null) return error("Invalid client id: " + msg.cid, ws);
      sendMessage(childWS, { type: "parentOffer", offer: msg.offer , pid: msg.pid });
      break;
    case "presentAnswer":
      console.log("redirect answer");
      var parentWS = clients.get(msg.pid); 
      if (parentWS == null) return error("Invalid client id: " + msg.pid, ws);
      sendMessage(parentWS, { type: "childAnswer", answer: msg.answer, pid: msg.pid , cid: msg.cid});
      break;
    case "createRoom":
      if (req.session.id == undefined) return error("Unknown client attempting to create classroom", ws);
      if (classrooms.has(msg.roomName)) return error("Room name already in use: " + msg.roomName, ws);
      console.log("created room", msg.roomName);
      classrooms.set(msg.roomName, new PeerTree(req.session.id));
      break;
    case "joinRoom": // only attribute -- roomName
      if (req.session.id == undefined) return error("Unknown client attempting to join classroom", ws);
      var classTree = classrooms.get(msg.roomName);
      if (classTree == undefined) return error("Unable to join non-existent classroom " + msg.roomName, ws);
      classTree.addChild(req.session.id);
      break;
    case "userChat":
      clients.forEach(ws => {
        sendMessage(ws, { type: "addChat" , text: msg.text, username: msg.username });
      });
      break;
    case "grantBroadcast":
      var tnode = peerNodes.get(req.session.id);
      tnode.allowBroadcast = true;
      var cnode = peerNodes.get(msg.cid);
      connect(cnode, tnode);
      break;  
    default: return error("Unknown message type: " + msg.type, ws);
  }
}

function connect(parentNode, newChild) {
  var parWS = clients.get(parentNode.clientID);
  if (parWS == undefined) return error("Undefined parent: " + parentNode.clientID);
  // check if connection already exists
  if (parentNode.children.has(newChild.clientID))
    return error(`Already connected ${parentNode.clientID} with ${childNodec.clientID}`);
  sendMessage(parWS, { type: "initiateConnection", pid: parentNode.clientID, cid: newChild.clientID });
}

const MAX_BRANCH = 2;

class PeerNode {
  constructor(clientID, parentNode) {
    this.clientID = clientID;
    this.parentNode = parentNode;
    this.children = new Map();
    peerNodes.set(this.clientID, this);
  }
  numCh() {
    return this.children.size;
  }

  // send message to this node to 
  // destroy connection with parent
  breakWithParent() {
    var ws = clients.get(this.clientID);    
    sendMessage(ws, {
      type: "breakWithParent"
    });
  }

  // send message to this node to
  // destroy all outgoing connections
  breakWithChild(cid) {
    var ws = clients.get(this.clientID);    
    sendMessage(ws, {
      type: "breakWithChild",
      cid: cid,
    });
  }

  isLeaf() {
    return this.numCh() == 0;
  }
}

class PeerTree {
  constructor(rootID) {
    this.rootID = rootID;
    this.root = new PeerNode(rootID);
    classroomSets.set(rootID, this);
  }

  // TODO wait for successful connection to update tree
  addChild(childID) {
    var leaf = this.bestLeaf();
    var newNode = new PeerNode(childID, leaf);
    connect(leaf, newNode);
    leaf.children.set(childID, newNode);
    classroomSets.set(newNode.clientID, this);
    console.log("joining ", childID, "with parent" , leaf.clientID);
  }

  // bfs
  bestLeaf() {
    if (this.root.numCh() < MAX_BRANCH) return this.root;
    var q = [this.root];
    while (q.length) {
      var cur = q.pop();
      // check each child individually and choose min if any < 5 (ret early if 0)
      var ch;
      var min = null;
      for (var [cid, ch] of cur.children) {
        if (ch.numCh() == 0) return ch;
        if (min == null) min = ch;
        else min = min.numCh() < ch.numCh() ? min : ch;
      }
      if (min && min.numCh() < MAX_BRANCH) return min;
      // keep bfsing
      cur.children.forEach(child => q.push(child));
    }
    return error(`ERROR cannot find leaf with < ${MAX_BRANCH} children.`);
  }

  closeClassroom(peerNode) {
    var ws = clients.get(peerNode.clientID);
    try {
      sendMessage(ws, { type: "classroomClosed" });
    }
    catch (err) {}
    peerNode.children.forEach(childNode => this.closeClassroom(childNode));
  }

  remove(peerNode) {
    if (peerNode === this.root) {  // teacher leaves classroom
      // delete class room name mapping
      this.closeClassroom(this.root);
      this.c
      return;
    }

    peerNode.children.forEach(childNode => childNode.breakWithParent());
    // break parent connection
    peerNode.parentNode.breakWithChild(peerNode.clientID);
    for (var [cid, ch] of peerNode.children) {
      if (ch.isLeaf()) { // replace with direct child 
        this.replaceWithChild(peerNode, ch);
        return;
      }
    }
    if (! peerNode.isLeaf()) this.replaceWithLeaf(peerNode); // no need to replace leaf node
    // remove from parent's list of children
    peerNode.parentNode.children.delete(peerNode.clientID);
  }

  // replace node with direct child -- no need to break connections with replacement and its parent (aka peerNode)
  replaceWithChild(peerNode, rep) { 
    connect(peerNode.parentNode, rep);
    
    peerNode.children.forEach(childNode => {
      if (childNode === rep) return;
      connect(rep, childNode);
    });
  }

  // replace node with deeper child (leaf) -- must break connection with deeper child and its parent
  replaceWithLeaf(peerNode) {
    var leaf = this.bestLeaf();
    leaf.breakWithParent();
    
    connect(peerNode.parentNode, leaf);

    peerNode.children.forEach(childNode => connect(leaf, childNode));
  }
}


