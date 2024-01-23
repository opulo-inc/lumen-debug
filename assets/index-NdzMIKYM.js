var k=Object.defineProperty;var A=(o,e,t)=>e in o?k(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var S=(o,e,t)=>(A(o,typeof e!="symbol"?e+"":e,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();class x{constructor(){S(this,"timeout",async e=>new Promise(t=>setTimeout(t,e)));this.modalObject=document.getElementById("modal"),this.overlay=document.getElementById("overlay"),this.modalTitle=document.getElementById("modal-title"),this.modalContent=document.getElementById("modal-content"),this.modalNumInput=document.getElementById("modal-num-input"),this.modalClose=document.getElementById("modal-close"),this.modalOK=document.getElementById("modal-ok"),this.receivedInput=void 0}hide(){this.modalObject.style.display="none",this.overlay.style.display="none"}async show(e,t,a){a===void 0&&(a=0),this.modalTitle.innerHTML=e,this.modalContent.innerHTML=t,this.modalObject.style.display="flex",this.overlay.style.display="block",a==0?this.modalNumInput.style.display="none":a==1&&(this.modalNumInput.style.display="block",this.modalNumInput.value=1),this.modalOK.focus();let n=await this.waitForUserSelection();return n&&a==1&&(n=this.modalNumInput.value),n}async waitForUserSelection(){for(;this.receivedInput===void 0;)await this.timeout(50);let e=this.receivedInput;return this.receivedInput=void 0,e}}class T{constructor(e){S(this,"delay",e=>new Promise(t=>setTimeout(t,e)));this.encoder=new TextEncoder,this.decoder=new TextDecoder,this.consoleDiv=document.getElementById("console"),this.port,this.modal=e,this.receiveBuffer=[],this.sentCommandBuffer=[""],this.sentCommandBufferIndex=0}appendToConsole(e,t){let a=document.createElement("p"),n=new Date().toISOString(),i="";t?i="[SEND]":i="[RECE]",a.innerHTML=i+" - "+n+" - "+e+`
`,this.consoleDiv.appendChild(a),this.consoleDiv.scrollTop=this.consoleDiv.scrollHeight}getNextBufferLine(){return this.receiveBuffer.shift()}clearBuffer(){for(;this.receiveBuffer.length>0;)this.receiveBuffer.shift()}async connect(){if(!navigator.serial)return this.modal.show("Browser Support","Please use a browser that supports WebSerial, like Chrome, Opera, or Edge. <a href='https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility'>Supported Browsers."),!1;const e=1155;return this.port=await navigator.serial.requestPort({filters:[{usbVendorId:e}]}),console.log("Port Selected."),await this.port.open({baudRate:115200,bufferSize:255,dataBits:8,flowControl:"none",parity:"none",stopBits:1}),console.log("Port Opened."),this.listen(),document.querySelector("#connect").style.background="green",document.querySelector("#connect").style.color="white",document.querySelector("#connect").innerHTML="Connected",!0}async listen(){var e;for(;(e=this.port)!=null&&e.readable;){console.log("Port is readable: Starting to listen.");let t="";document.getElementById("console");const a=this.port.readable.getReader();try{for(;;){const{value:n,done:i}=await a.read();if(i){console.log("Closing reader.");break}const l=this.decoder.decode(n);for(t=t.concat(l);t.indexOf(`
`)!=-1;){let s=t.split(`
`);this.receiveBuffer.push(s[0]),this.appendToConsole(s[0],!1),t=t.split(`
`).slice(1).join(`
`)}}}catch(n){console.error("Reading error.",n)}finally{a.releaseLock()}}}async send(e){var t;if(console.log("sending: ",e),(t=this.port)!=null&&t.writable){const a=await this.port.writable.getWriter();for(const n of e)await a.write(this.encoder.encode(n+`
`)),this.appendToConsole(n,!0);a.releaseLock()}else this.modal.show("Cannot Write","Cannot write to port. Have you connected?")}async sendRepl(){let e=[document.querySelector("#repl-input").value];this.sentCommandBuffer.splice(1,0,e[0]),this.sentCommandBufferIndex=0,this.send(e)}async leftAirOn(){const e=["M106","M106 P1 S255"];await this.send(e)}async leftAirOff(){const e=["M107","M107 P1"];await this.send(e)}async rightAirOn(){const e=["M106 P2 S255","M106 P3 S255"];await this.send(e)}async rightAirOff(){const e=["M107 P2","M107 P3"];await this.send(e)}async ledOn(){const e=["M150 P255 R255 U255 B255"];await this.send(e)}async ledOff(){const e=["M150 P0"];await this.send(e)}async readLeftVac(){var u;if(!((u=this.port)!=null&&u.writable))return this.modal.show("Cannot Write","Cannot write to port. Have you connected?"),!1;const e=["M260 A112 B1 S1","M260 A109","M260 B48","M260 B10","M260 S1"],t=40;this.clearBuffer();let a,n,i;const l=new RegExp("data:(..)");await this.send(e),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let m=this.receiveBuffer[s];if(l.test(m)){a=m.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let f=this.receiveBuffer[s];if(l.test(f)){n=f.match("data:(..)")[1];break}}await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let f=this.receiveBuffer[s];if(l.test(f)){i=f.match("data:(..)")[1];break}}let r=parseInt(a+n+i,16);await this.modal.show("Left Vacuum Sensor Value",r)}async readRightVac(){var u;if(!((u=this.port)!=null&&u.writable))return this.modal.show("Cannot Write","Cannot write to port. Have you connected?"),!1;const e=["M260 A112 B2 S1","M260 A109","M260 B48","M260 B10","M260 S1"],t=40;let a,n,i;const l=new RegExp("data:(..)");this.clearBuffer(),await this.send(e),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let m=this.receiveBuffer[s];if(l.test(m)){a=m.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let f=this.receiveBuffer[s];if(l.test(f)){n=f.match("data:(..)")[1];break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(t);for(var s=0,d=this.receiveBuffer.length;s<d;s++){let f=this.receiveBuffer[s];if(l.test(f)){i=f.match("data:(..)")[1];break}}let r=parseInt(a+n+i,16);await this.modal.show("Right Vacuum Sensor Value",r)}async testTMC(){var n;if(!((n=this.port)!=null&&n.writable))return this.modal.show("Cannot Write","Cannot write to port. Have you connected?"),!1;let e="";const t=["M122"];await this.clearBuffer(),await this.send(t),await this.delay(5e3),console.log(this.receiveBuffer);for(let i=0;i<this.receiveBuffer.length;i++)e=e.concat(this.receiveBuffer[i]+`
`);if(await this.modal.show("Stepper Driver Test Complete","Test is complete. Click OK to download test report.")==!0){let i=new Date().toISOString();i=i+"-tmctest.txt",this.download(i,e)}}async testVac(){var p;if(!((p=this.port)!=null&&p.writable))return this.modal.show("Cannot Write","Cannot write to port. Have you connected?"),!1;let e="";const t=["M260 A112 B1 S1","M260 A109","M260 B48","M260 B10","M260 S1"],a=["M260 A112 B2 S1","M260 A109","M260 B48","M260 B10","M260 S1"],n=100;this.clearBuffer();let i,l,s;const d=new RegExp("data:(..)");await this.send(t),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let E=this.receiveBuffer[r];if(d.test(E)){i=E.match("data:(..)")[1],e=e.concat("Left MSB - "+i+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let g=this.receiveBuffer[r];if(d.test(g)){l=g.match("data:(..)")[1],e=e.concat("Left CSB - "+l+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let g=this.receiveBuffer[r];if(d.test(g)){s=g.match("data:(..)")[1],e=e.concat("Left LSB - "+s+`
`);break}}let m=parseInt(i+l+s,16);e=e.concat("Left Val - "+m+`
`),this.clearBuffer(),await this.send(a),await this.send(["M260 A109 B6 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let g=this.receiveBuffer[r];if(d.test(g)){i=g.match("data:(..)")[1],e=e.concat("Right MSB - "+i+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B7 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let g=this.receiveBuffer[r];if(d.test(g)){l=g.match("data:(..)")[1],e=e.concat("Right CSB - "+l+`
`);break}}this.clearBuffer(),await this.send(["M260 A109 B8 S1"]),await this.send(["M261 A109 B1 S1"]),await this.delay(n),console.log("current buffer length: ",this.receiveBuffer.length);for(var r=0,u=this.receiveBuffer.length;r<u;r++){let g=this.receiveBuffer[r];if(d.test(g)){s=g.match("data:(..)")[1],e=e.concat("Right LSB - "+s+`
`);break}}let y=parseInt(i+l+s,16);if(e=e.concat("Right Val - "+y+`
`),console.log(m,y),await this.modal.show("Vacuum Sensor Test Complete","Test is complete. Click OK to download test report.")==!0){let E=new Date().toISOString();E=E+"-vactest.txt",this.download(E,e)}}download(e,t){var a=document.createElement("a");a.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),a.setAttribute("download",e),a.style.display="none",document.body.appendChild(a),a.click(),document.body.removeChild(a)}}let h={GET_ID:[1,"UNICAST",1],INITIALIZE:[2,"UNICAST",13],GET_VERSION:[3,"UNICAST",1],MOVE_FEED_FORWARD:[4,"UNICAST",2],MOVE_FEED_BACKWARD:[5,"UNICAST",2],MOVE_FEED_STATUS:[6,"UNICAST",1],VENDOR_OPTIONS:[191,"UNICAST",0],GET_FEEDER_ADDRESS:[192,"BROADCAST",13],IDENTIFY_FEEDER:[193,"BROADCAST",13],PROGRAM_FEEDER_FLOOR:[194,"BROADCAST",14],UNINITIALIZED_FEEDERS_RESPOND:[195,"BROADCAST",1]};const C="/assets/feeder-icon-oeVaefd-.png";class M{constructor(e,t){this.serial=e,this.packetID=0,this.feeders=[],this.modal=t}beautifyResponse(e){let t="",a=e.slice(6);for(let n=0;n<a.length;n++)t=t+this.intToHexString(a[n])+" ";alert("From: "+this.intToHexString(e[1])+`
PacketID: `+this.intToHexString(e[2])+`
Payload Length: `+this.intToHexString(e[3])+`
Checksum: `+this.intToHexString(e[4])+`
Status: `+this.intToHexString(e[5])+`
Payload: `+t)}intToHexString(e){let t=e.toString(16).toUpperCase();return t.length==1&&(t="0".concat(t)),"0x".concat(t)}calcCRC(e){let t=0;for(var a=0;a<e.length;a++){t=t^e[a]<<8;for(let n=0;n<8;n++)t&32768&&(t=t^33664),t<<=1}return t>>8&255}hexStringToIntArray(e){let t=[];console.log("string: ",e);for(let a=0;a<e.length/2;a++){let n=a*2,i=e.slice(n,n+2),l=parseInt(i,16);t[a]=l}return t}validatePacketCrc(e){let t=e[4],a=e.slice(0,4).concat(e.slice(5)),n=this.calcCRC(a);return t!=n?(console.log("Received packet had CRC mismatch."),!1):!0}intArrayToHexString(e){let t="";for(let a=0;a<e.length;a++){let n=e[a].toString(16).toUpperCase();n.length==1&&(n="0".concat(n)),t=t.concat(n)}return t}getGcodeFromPacketAndPayloadArray(e){let t=e,a=this.calcCRC(e);t.splice(4,0,a),console.log("finalArray: ",t);let n=this.intArrayToHexString(t);return"M485 ".concat(n)}async sendPacket(e,t,a){if(e[1]=="UNICAST"&&t=="")return console.log("Error: Selected command requires address."),!1;if(e[2]>1&&a===void 0)return console.log("Error: Selected command requires payload."),!1;let n;e[2]==0?(console.log("first one"),console.log(a.length),n=[t,0,this.packetID,a.length+1]):n=[t,0,this.packetID,e[2]],console.log(n," header");let i=n.concat([e[0]]);(e[2]>1||e[2]==0)&&(i=i.concat(a));let l=this.getGcodeFromPacketAndPayloadArray(i);this.serial.clearBuffer(),await this.serial.send([l]);let s=Date.now();for(;;){if(await this.serial.delay(10),Date.now()-s>400)return console.log("Timeout: didn't get serial response."),!1;let y=!1;console.log(this.serial.receiveBuffer);const f=new RegExp("ok");for(let p=0,E=this.serial.receiveBuffer.length;p<E;p++){let w=this.serial.receiveBuffer[p];if(y=f.test(w),y)break}if(y)break}let d=this.packetID;this.packetID<255?this.packetID++:this.packetID=0;let r="";const u=new RegExp("rs485-reply:");for(let y=0,f=this.serial.receiveBuffer.length;y<f;y++){let p=this.serial.receiveBuffer[y];if(u.test(p)){r=p.match("rs485-reply: (.*)")[1];break}}if(r=="TIMEOUT")return console.log("Received TIMEOUT."),!1;if(r=="")return this.modal.show("Photon Support","Your version of Marlin does not support Photon. Please update Marlin to the version in the <a href='https://github.com/opulo-inc/lumenpnp/releases'>latest LumenPnP release</a> using the instructions <a href='https://docs.opulo.io/byop/motherboard/update-firmware/'>here</a>."),!1;let m=this.hexStringToIntArray(r);return this.validatePacketCrc(m)?m[2]!=d?(console.log("Returning packet ID mismatched sent packet ID."),!1):m:!1}async sendUnicast(){let e=document.getElementById("uni-to").value,t=document.getElementById("uni-command").value,a=document.getElementById("uni-payload").value;e=parseInt(e),a=this.hexStringToIntArray(a);let n;t==1?n=await this.sendPacket(h.GET_ID,e):t==2?n=await this.sendPacket(h.INITIALIZE,e,a):t==3?n=await this.sendPacket(h.GET_VERSION,e):t==4?n=await this.sendPacket(h.MOVE_FEED_FORWARD,e,a):t==5?n=await this.sendPacket(h.MOVE_FEED_BACKWARD,e,a):t==6?n=await this.sendPacket(h.MOVE_FEED_STATUS,e):t==191&&(console.log(a),n=await this.sendPacket(h.VENDOR_OPTIONS,e,a)),n!=!1?this.beautifyResponse(n):this.modal.show("Invalid Packet","We did not receive a valid packet.")}async sendBroadcast(){let e=document.getElementById("broad-program-address").value,t=document.getElementById("broad-command").value,a=document.getElementById("broad-uuid").value;e=parseInt(e),a=this.hexStringToIntArray(a);let n;t==192?n=await this.sendPacket(h.GET_FEEDER_ADDRESS,255,a):t==193?n=await this.sendPacket(h.IDENTIFY_FEEDER,255,a):t==194?(a.push(e),n=await this.sendPacket(h.PROGRAM_FEEDER_FLOOR,255,a)):t==195&&(n=await this.sendPacket(h.UNINITIALIZED_FEEDERS_RESPOND,255)),n!=!1?this.beautifyResponse(n):this.modal.show("Invalid Packet","We did not receive a valid packet.")}async customPacket(){let e=parseInt(document.getElementById("custom-to").value),t=parseInt(document.getElementById("calc-command").value),a=parseInt(document.getElementById("calc-payload").value);if(e===NaN||t===NaN)return this.modal.show("Invalid Command","Please make sure you've entered at least a To Address and a Command."),!1;let n;a==""?n=await this.sendPacket(t,e):n=await this.sendPacket(t,e,a),n!=!1?this.beautifyResponse(n):this.modal.show("Invalid Packet","We did not receive a valid packet.")}async calculateUserCRC(){let e=parseInt(document.getElementById("calc-to").value),t=parseInt(document.getElementById("calc-from").value),a=parseInt(document.getElementById("calc-packetid").value),n=parseInt(document.getElementById("calc-payload-length").value),i=parseInt(document.getElementById("calc-command").value),l=this.hexStringToIntArray(document.getElementById("calc-payload").value),s=[e,t,a,n,i];s=s.concat(l);let d=this.calcCRC(s);this.modal.show("CRC Result",d)}async scan(){let e=50;for(let t=1;t<e+1;t++){let a=await this.sendPacket(h.GET_ID,t);if(a!=!1&&a[5]==0){let n=a.slice(6);if((await this.sendPacket(h.INITIALIZE,t,n))[5]==0){console.log("found one at ",t),n=this.intArrayToHexString(n);let l=t.toString(),s=document.createElement("div"),d=document.createElement("img");d.src=C;let r=document.createElement("H3"),u=document.createTextNode(l);r.appendChild(u);let m=document.createElement("H4"),y=document.createTextNode(n);m.appendChild(y);let f=document.createElement("button"),p=document.createTextNode("Identify");f.appendChild(p),f.classList.add("identify");let E=document.createElement("button"),w=document.createTextNode("Feed");E.appendChild(w),E.classList.add("feed"),s.appendChild(d),s.appendChild(r),s.appendChild(m),s.appendChild(f),s.appendChild(E),s.classList.add("found-feeder"),document.getElementById("found-feeders").appendChild(s)}}}document.getElementById("feeder-scan").innerHTML="Scan"}async programSlotsUtility(){let e=await this.modal.show("Before Beginning",`To program your slots, first remove all Photon feeders from your machine. Once you've done this, click ok.

If at any point you'd like to exit this utility, click cancel.`);if(console.log(e),!e)return!1;for(;;){let t=await this.modal.show("Insert a Feeder","Insert a feeder into the slot you'd like to program. Enter the address you'd like to program in the field below. Once you've done this, click ok.",1);if(!t)return!1;t=parseInt(t);let a=await this.sendPacket(h.UNINITIALIZED_FEEDERS_RESPOND,255);if(a==!1)e=await this.modal.show("Programming Feeder Not Found","The feeder you inserted was not detected.");else{await this.sendPacket(h.PROGRAM_FEEDER_FLOOR,255,a.slice(6).concat(t));let n=await this.sendPacket(h.GET_FEEDER_ADDRESS,255,a.slice(6));if(n!=!1&&n[1]==t){if(e=await this.modal.show("Success","Slot has been programmed with address "+t+"! Remove the feeder from the slot, then click OK to program another."),!e)return!1}else if(e=await this.modal.show("Failure","Programming Failed for slot "+t+". Click OK to retry."),!e)return!1}}}}let B=new x,c=new T(B),I=new M(c,B);document.getElementById("modal-close").addEventListener("click",()=>{B.receivedInput=!1,B.hide()});document.getElementById("modal-ok").addEventListener("keyup",function(o){o.code==="Enter"&&(o.preventDefault(),B.receivedInput=!0,B.hide())});document.getElementById("modal-ok").addEventListener("click",()=>{B.receivedInput=!0,B.hide()});document.getElementById("modal-ng").addEventListener("click",()=>{B.receivedInput=!1,B.hide()});function R(){document.getElementById("repl-input").value=""}document.getElementById("repl-input").addEventListener("keyup",function(o){if(o.code==="Enter")o.preventDefault(),document.getElementById("send").click();else if(o.code==="ArrowUp"){if(o.preventDefault(),c.sentCommandBufferIndex==c.sentCommandBuffer.length-1)return!1;c.sentCommandBufferIndex++,document.getElementById("repl-input").value=c.sentCommandBuffer[c.sentCommandBufferIndex]}else if(o.code==="ArrowDown"){if(o.preventDefault(),c.sentCommandBufferIndex==0)return!1;c.sentCommandBufferIndex--,document.getElementById("repl-input").value=c.sentCommandBuffer[c.sentCommandBufferIndex]}});document.getElementById("uni-command").addEventListener("change",()=>{let o=document.getElementById("uni-command").value;["0x01","0x03","0x06"].includes(o)?(document.getElementById("uni-payload").style.display="none",document.getElementById("uni-payload-label").style.display="none"):(document.getElementById("uni-payload").style.display="inline",document.getElementById("uni-payload-label").style.display="inline")});document.getElementById("connect").addEventListener("click",()=>{c.connect()});document.getElementById("send").addEventListener("click",()=>{c.sendRepl(),R()});document.getElementById("tmc").addEventListener("click",()=>{c.testTMC()});document.getElementById("vac").addEventListener("click",()=>{c.testVac()});document.getElementById("left-air-on").addEventListener("click",()=>{c.leftAirOn()});document.getElementById("left-air-off").addEventListener("click",()=>{c.leftAirOff()});document.getElementById("right-air-on").addEventListener("click",()=>{c.rightAirOn()});document.getElementById("right-air-off").addEventListener("click",()=>{c.rightAirOff()});document.getElementById("ring-lights-on").addEventListener("click",()=>{c.ledOn()});document.getElementById("ring-lights-off").addEventListener("click",()=>{c.ledOff()});document.getElementById("left-vac").addEventListener("click",()=>{c.readLeftVac()});document.getElementById("right-vac").addEventListener("click",()=>{c.readRightVac()});document.getElementById("feeder-scan").addEventListener("click",()=>{var o;if(!((o=c.port)!=null&&o.writable))return alert("Cannot write to port. Have you connected?"),!1;document.getElementById("found-feeders").style.display="flex",document.getElementById("found-feeders").innerHTML="",document.getElementById("feeder-scan").innerHTML="Scanning...",I.scan()});document.getElementById("uni-send").addEventListener("click",()=>{I.sendUnicast()});document.getElementById("broad-send").addEventListener("click",()=>{I.sendBroadcast()});document.getElementById("calc-calculate").addEventListener("click",()=>{I.calculateUserCRC()});document.getElementById("program-slots").addEventListener("click",()=>{I.programSlotsUtility()});document.getElementById("more-controls").addEventListener("click",()=>{document.getElementById("unicast").style.display="block",document.getElementById("broadcast").style.display="block",document.getElementById("custom-packet").style.display="block",document.getElementById("crc-tool").style.display="block"});document.getElementById("found-feeders").addEventListener("click",function(o){let e=o.target;if(e.className.split(" ").includes("identify")&&e.nodeName=="BUTTON"){let a=e.parentElement.getElementsByTagName("H4")[0].innerHTML;a=I.hexStringToIntArray(a),I.sendPacket(h.IDENTIFY_FEEDER,255,a)}else if(e.className.split(" ").includes("feed")&&e.nodeName=="BUTTON"){let a=e.parentElement.getElementsByTagName("H3")[0].innerHTML;a=parseInt(a),I.sendPacket(h.MOVE_FEED_FORWARD,a,40)}});
