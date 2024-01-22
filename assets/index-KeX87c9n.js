var S=Object.defineProperty;var A=(u,e,t)=>e in u?S(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t;var w=(u,e,t)=>(A(u,typeof e!="symbol"?e+"":e,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();class x{constructor(){w(this,"delay",e=>new Promise(t=>setTimeout(t,e)));this.encoder=new TextEncoder,this.decoder=new TextDecoder,this.consoleDiv=document.getElementById("console"),this.port,this.receiveBuffer=[]}appendToConsole(e,t){let a=document.createElement("p"),n=new Date().toISOString(),i="";t?i="[SEND]":i="[RECE]",a.innerHTML=i+" - "+n+" - "+e+`
`,this.consoleDiv.appendChild(a),this.consoleDiv.scrollTop=this.consoleDiv.scrollHeight}getNextBufferLine(){return this.receiveBuffer.shift()}clearBuffer(){for(;this.receiveBuffer.length>0;)this.receiveBuffer.shift()}async connect(){if(!navigator.serial)return alert("Please use a browser that supports WebSerial (Chrome)."),!1;const e=1155;return this.port=await navigator.serial.requestPort({filters:[{usbVendorId:e}]}),console.log("Port Selected."),await this.port.open({baudRate:115200,bufferSize:255,dataBits:8,flowControl:"none",parity:"none",stopBits:1}),console.log("Port Opened."),this.listen(),document.querySelector("#connect").style.background="green",document.querySelector("#connect").style.color="white",document.querySelector("#connect").innerHTML="Connected",!0}async listen(){var e;for(;(e=this.port)!=null&&e.readable;){console.log("Port is readable: Starting to listen.");let t="";document.getElementById("console");const a=this.port.readable.getReader();try{for(;;){const{value:n,done:i}=await a.read();if(i){console.log("Closing reader.");break}const s=this.decoder.decode(n);for(t=t.concat(s);t.indexOf(`
`)!=-1;){let r=t.split(`
`);this.receiveBuffer.push(r[0]),this.appendToConsole(r[0],!1),t=t.split(`
`).slice(1).join(`
`)}}}catch(n){console.error("Reading error.",n)}finally{a.releaseLock()}}}async send(e){var t;if(console.log("sending: ",e),(t=this.port)!=null&&t.writable){const a=await this.port.writable.getWriter();for(const n of e)await a.write(this.encoder.encode(n+`
`)),this.appendToConsole(n,!0);a.releaseLock()}else alert("Cannot write to port. Have you connected?")}async sendRepl(){let e=[document.querySelector("#repl-input").value];this.send(e)}async leftAirOn(){const e=["M106","M106 P1 S255"];await this.send(e)}async leftAirOff(){const e=["M107","M107 P1"];await this.send(e)}async rightAirOn(){const e=["M106 P2 S255","M106 P3 S255"];await this.send(e)}async rightAirOff(){const e=["M107 P2","M107 P3"];await this.send(e)}async ledOn(){const e=["M150 P255 R255 U255 B255"];await this.send(e)}async ledOff(){const e=["M150 P0"];await this.send(e)}async readLeftVac(){var o;if(!((o=this.port)!=null&&o.writable))return alert("Cannot write to port. Have you connected?"),!1;const e=["M260 A112 B1 S1","M260 A109","M260 B48","M260 B10","M260 S1"],t=40;this.clearBuffer();let a,n,i;const s=new RegExp("data:(..)");await this.send(e),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let f=this.receiveBuffer[r];if(s.test(f)){a=f.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let d=this.receiveBuffer[r];if(s.test(d)){n=d.match("data:(..)")[1];break}}await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let d=this.receiveBuffer[r];if(s.test(d)){i=d.match("data:(..)")[1];break}}let l=parseInt(a+n+i,16);alert("Left vac sensor value: "+l)}async readRightVac(){var o;if(!((o=this.port)!=null&&o.writable))return alert("Cannot write to port. Have you connected?"),!1;const e=["M260 A112 B2 S1","M260 A109","M260 B48","M260 B10","M260 S1"],t=40;let a,n,i;const s=new RegExp("data:(..)");this.clearBuffer(),await this.send(e),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let f=this.receiveBuffer[r];if(s.test(f)){a=f.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let d=this.receiveBuffer[r];if(s.test(d)){n=d.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var r=0,c=this.receiveBuffer.length;r<c;r++){let d=this.receiveBuffer[r];if(s.test(d)){i=d.match("data:(..)")[1];break}}let l=parseInt(a+n+i,16);alert("Right vacuum sensor value: "+l)}async testTMC(){var n;if(!((n=this.port)!=null&&n.writable))return alert("Cannot write to port. Have you connected?"),!1;let e="";const t=["M122"];await this.clearBuffer(),await this.send(t),await this.delay(5e3),console.log(this.receiveBuffer),alert("Downloading test results.");let a=new Date().toISOString();a=a+"-tmctest.txt";for(let i=0;i<this.receiveBuffer.length;i++)e=e.concat(this.receiveBuffer[i]+`
`);this.download(a,e)}async testVac(){var p;if(!((p=this.port)!=null&&p.writable))return alert("Cannot write to port. Have you connected?"),!1;let e="";const t=["M260 A112 B1 S1","M260 A109","M260 B48","M260 B10","M260 S1"],a=["M260 A112 B2 S1","M260 A109","M260 B48","M260 B10","M260 S1"],n=100;this.clearBuffer();let i,s,r;const c=new RegExp("data:(..)");await this.send(t),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let B=this.receiveBuffer[l];if(c.test(B)){i=B.match("data:(..)")[1],e=e.concat("Left MSB - "+i+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let h=this.receiveBuffer[l];if(c.test(h)){s=h.match("data:(..)")[1],e=e.concat("Left CSB - "+s+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let h=this.receiveBuffer[l];if(c.test(h)){r=h.match("data:(..)")[1],e=e.concat("Left LSB - "+r+`
`);break}}let f=parseInt(i+s+r,16);e=e.concat("Left Val - "+f+`
`),this.clearBuffer(),await this.send(a),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let h=this.receiveBuffer[l];if(c.test(h)){i=h.match("data:(..)")[1],e=e.concat("Right MSB - "+i+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let h=this.receiveBuffer[l];if(c.test(h)){s=h.match("data:(..)")[1],e=e.concat("Right CSB - "+s+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n),console.log("current buffer length: ",this.receiveBuffer.length);for(var l=0,o=this.receiveBuffer.length;l<o;l++){let h=this.receiveBuffer[l];if(c.test(h)){r=h.match("data:(..)")[1],e=e.concat("Right LSB - "+r+`
`);break}}let y=parseInt(i+s+r,16);e=e.concat("Right Val - "+y+`
`),console.log(f,y),alert("Downloading test result. Left Sensor: "+f+", Right Sensor: "+y);let d=new Date().toISOString();d=d+"-vactest.txt",this.download(d,e)}download(e,t){var a=document.createElement("a");a.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),a.setAttribute("download",e),a.style.display="none",document.body.appendChild(a),a.click(),document.body.removeChild(a)}}let m={GET_ID:[1,"UNICAST",1],INITIALIZE:[2,"UNICAST",13],GET_VERSION:[3,"UNICAST",1],MOVE_FEED_FORWARD:[4,"UNICAST",2],MOVE_FEED_BACKWARD:[5,"UNICAST",2],MOVE_FEED_STATUS:[6,"UNICAST",1],VENDOR_OPTIONS:[191,"UNICAST",0],GET_FEEDER_ADDRESS:[192,"BROADCAST",13],IDENTIFY_FEEDER:[193,"BROADCAST",13],PROGRAM_FEEDER_FLOOR:[194,"BROADCAST",14],UNINITIALIZED_FEEDERS_RESPOND:[195,"BROADCAST",1]};const T="/assets/feeder-icon-oeVaefd-.png";class k{constructor(e){this.serial=e,this.packetID=0,this.feeders=[]}beautifyResponse(e){let t="",a=e.slice(6);for(let n=0;n<a.length;n++)t=t+this.intToHexString(a[n])+" ";alert("From: "+this.intToHexString(e[1])+`
PacketID: `+this.intToHexString(e[2])+`
Payload Length: `+this.intToHexString(e[3])+`
Checksum: `+this.intToHexString(e[4])+`
Status: `+this.intToHexString(e[5])+`
Payload: `+t)}intToHexString(e){let t=e.toString(16).toUpperCase();return t.length==1&&(t="0".concat(t)),"0x".concat(t)}calcCRC(e){let t=0;for(var a=0;a<e.length;a++){t=t^e[a]<<8;for(let n=0;n<8;n++)t&32768&&(t=t^33664),t<<=1}return t>>8&255}hexStringToIntArray(e){let t=[];console.log("string: ",e);for(let a=0;a<e.length/2;a++){let n=a*2,i=e.slice(n,n+2),s=parseInt(i,16);t[a]=s}return t}validatePacketCrc(e){let t=e[4],a=e.slice(0,4).concat(e.slice(5)),n=this.calcCRC(a);return t!=n?(console.log("Received packet had CRC mismatch."),!1):!0}intArrayToHexString(e){let t="";for(let a=0;a<e.length;a++){let n=e[a].toString(16).toUpperCase();n.length==1&&(n="0".concat(n)),t=t.concat(n)}return t}getGcodeFromPacketAndPayloadArray(e){let t=e,a=this.calcCRC(e);t.splice(4,0,a),console.log("finalArray: ",t);let n=this.intArrayToHexString(t);return"M485 ".concat(n)}processResponse_GET_ID(e,t,a){if(e[2]!=t)return console.log("packetids dont match"),!1;if(e[1]!=a)return console.log("address doesnt matchr"),!1;e.splice(0,5),console.log(e);let n="";for(let i=0;i<e.length;i++){let s=e[i].toString(16);s.length==1&&(s="0".concat(s)),n=n.concat(s.toUpperCase())}console.log("UUID: ",n)}async sendPacket(e,t,a){if(e[1]=="UNICAST"&&t=="")return console.log("Error: Selected command requires address."),!1;if(e[2]>1&&a===void 0)return console.log("Error: Selected command requires payload."),!1;let n;e[2]==0?(console.log("first one"),console.log(a.length),n=[t,0,this.packetID,a.length+1]):n=[t,0,this.packetID,e[2]],console.log(n," header");let i=n.concat([e[0]]);(e[2]>1||e[2]==0)&&(i=i.concat(a));let s=this.getGcodeFromPacketAndPayloadArray(i);this.serial.clearBuffer(),await this.serial.send([s]),await this.serial.delay(200);let r=this.packetID;this.packetID<255?this.packetID++:this.packetID=0;let c;const l=new RegExp("rs485-reply:");for(let f=0,y=this.serial.receiveBuffer.length;f<y;f++){let d=this.serial.receiveBuffer[f];if(l.test(d)){c=d.match("rs485-reply: (.*)")[1];break}}if(c=="TIMEOUT")return console.log("Received TIMEOUT."),!1;let o=this.hexStringToIntArray(c);return this.validatePacketCrc(o)?o[2]!=r?(console.log("Returning packet ID mismatched sent packet ID."),!1):o:!1}async sendUnicast(){let e=document.getElementById("uni-to").value,t=document.getElementById("uni-command").value,a=document.getElementById("uni-payload").value;e=parseInt(e),a=this.hexStringToIntArray(a);let n;t==1?n=await this.sendPacket(m.GET_ID,e):t==2?n=await this.sendPacket(m.INITIALIZE,e,a):t==3?n=await this.sendPacket(m.GET_VERSION,e):t==4?n=await this.sendPacket(m.MOVE_FEED_FORWARD,e,a):t==5?n=await this.sendPacket(m.MOVE_FEED_BACKWARD,e,a):t==6?n=await this.sendPacket(m.MOVE_FEED_STATUS,e):t==191&&(console.log(a),n=await this.sendPacket(m.VENDOR_OPTIONS,e,a)),n!=!1?this.beautifyResponse(n):alert("We did not receive a valid packet.")}async sendBroadcast(){let e=document.getElementById("broad-program-address").value,t=document.getElementById("broad-command").value,a=document.getElementById("broad-uuid").value;e=parseInt(e),a=this.hexStringToIntArray(a);let n;t==192?n=await this.sendPacket(m.GET_FEEDER_ADDRESS,255,a):t==193?n=await this.sendPacket(m.IDENTIFY_FEEDER,255,a):t==194?(a.push(e),n=await this.sendPacket(m.PROGRAM_FEEDER_FLOOR,255,a)):t==195&&(n=await this.sendPacket(m.UNINITIALIZED_FEEDERS_RESPOND,255)),n!=!1?this.beautifyResponse(n):alert("We did not receive a valid packet.")}async customPacket(){let e=parseInt(document.getElementById("custom-to").value),t=parseInt(document.getElementById("calc-command").value),a=parseInt(document.getElementById("calc-payload").value);if(e===NaN||t===NaN)return alert("Please make sure you've entered at least a To Address and a Command"),!1;let n;a==""?n=await this.sendPacket(t,e):n=await this.sendPacket(t,e,a),n!=!1?this.beautifyResponse(n):alert("We did not receive a valid packet.")}async calculateUserCRC(){let e=parseInt(document.getElementById("calc-to").value),t=parseInt(document.getElementById("calc-from").value),a=parseInt(document.getElementById("calc-packetid").value),n=parseInt(document.getElementById("calc-payload-length").value),i=parseInt(document.getElementById("calc-command").value),s=this.hexStringToIntArray(document.getElementById("calc-payload").value),r=[e,t,a,n,i];r=r.concat(s);let c=this.calcCRC(r);alert(c)}async scan(){let e=50;for(let t=1;t<e+1;t++){let a=await this.sendPacket(m.GET_ID,t);if(a!=!1&&a[5]==0){let n=a.slice(6);if((await this.sendPacket(m.INITIALIZE,t,n))[5]==0){console.log("found one at ",t),n=this.intArrayToHexString(n);let s=t.toString(),r=document.createElement("div"),c=document.createElement("img");c.src=T;let l=document.createElement("H3"),o=document.createTextNode(s);l.appendChild(o);let f=document.createElement("H4"),y=document.createTextNode(n);f.appendChild(y);let d=document.createElement("button"),p=document.createTextNode("Identify");d.appendChild(p),d.classList.add("identify");let B=document.createElement("button"),v=document.createTextNode("Feed");B.appendChild(v),B.classList.add("feed"),r.appendChild(c),r.appendChild(l),r.appendChild(f),r.appendChild(d),r.appendChild(B),r.classList.add("found-feeder"),document.getElementById("found-feeders").appendChild(r)}}}document.getElementById("feeder-scan").innerHTML="Scan"}}let g=new x,E=new k(g);function M(){document.getElementById("repl-input").value=""}document.getElementById("repl-input").addEventListener("keyup",function(u){u.keyCode===13&&(u.preventDefault(),document.getElementById("send").click())});document.getElementById("uni-command").addEventListener("change",()=>{let u=document.getElementById("uni-command").value;["0x01","0x03","0x06"].includes(u)?(document.getElementById("uni-payload").style.display="none",document.getElementById("uni-payload-label").style.display="none"):(document.getElementById("uni-payload").style.display="inline",document.getElementById("uni-payload-label").style.display="inline")});document.getElementById("connect").addEventListener("click",()=>{g.connect()});document.getElementById("send").addEventListener("click",()=>{g.sendRepl(),M()});document.getElementById("tmc").addEventListener("click",()=>{g.testTMC()});document.getElementById("vac").addEventListener("click",()=>{g.testVac()});document.getElementById("left-air-on").addEventListener("click",()=>{g.leftAirOn()});document.getElementById("left-air-off").addEventListener("click",()=>{g.leftAirOff()});document.getElementById("right-air-on").addEventListener("click",()=>{g.rightAirOn()});document.getElementById("right-air-off").addEventListener("click",()=>{g.rightAirOff()});document.getElementById("ring-lights-on").addEventListener("click",()=>{g.ledOn()});document.getElementById("ring-lights-off").addEventListener("click",()=>{g.ledOff()});document.getElementById("left-vac").addEventListener("click",()=>{g.readLeftVac()});document.getElementById("right-vac").addEventListener("click",()=>{g.readRightVac()});document.getElementById("feeder-scan").addEventListener("click",()=>{var u;if(!((u=g.port)!=null&&u.writable))return alert("Cannot write to port. Have you connected?"),!1;document.getElementById("found-feeders").style.display="flex",document.getElementById("found-feeders").innerHTML="",document.getElementById("feeder-scan").innerHTML="Scanning...",E.scan()});document.getElementById("uni-send").addEventListener("click",()=>{E.sendUnicast()});document.getElementById("broad-send").addEventListener("click",()=>{E.sendBroadcast()});document.getElementById("calc-calculate").addEventListener("click",()=>{E.calculateUserCRC()});document.getElementById("more-controls").addEventListener("click",()=>{document.getElementById("unicast").style.display="block",document.getElementById("broadcast").style.display="block",document.getElementById("custom-packet").style.display="block",document.getElementById("crc-tool").style.display="block"});document.getElementById("found-feeders").addEventListener("click",function(u){let e=u.target;if(e.className.split(" ").includes("identify")&&e.nodeName=="BUTTON"){let a=e.parentElement.getElementsByTagName("H4")[0].innerHTML;a=E.hexStringToIntArray(a),E.sendPacket(m.IDENTIFY_FEEDER,255,a)}else if(e.className.split(" ").includes("feed")&&e.nodeName=="BUTTON"){let a=e.parentElement.getElementsByTagName("H3")[0].innerHTML;a=parseInt(a),E.sendPacket(m.MOVE_FEED_FORWARD,a,40)}});
