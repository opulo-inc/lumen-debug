import './style.css'
import { modalManager } from './modal.js'
import { serialManager } from './serialManager.js';
import { feederBus } from './feederBus';
import { commands } from './commands.js'

let modal = new modalManager();
let serial = new serialManager(modal);
let feeder = new feederBus(serial, modal);

document.getElementById("modal-close").addEventListener("click", () => {
  modal.receivedInput = false;
  modal.hide();
});

document.getElementById("modal-ok").addEventListener("keyup", function(event) {
  if (event.code === "Enter"){
    event.preventDefault();
    modal.receivedInput = true;
    modal.hide();
  }
});

document.getElementById("modal-ok").addEventListener("click", () => {
  modal.receivedInput = true;
  modal.hide();
});

document.getElementById("modal-ng").addEventListener("click", () => {
  modal.receivedInput = false;
  modal.hide();
});

//clears the contents of the repl text field
function clearReplInput(){
  document.getElementById("repl-input").value = "";
}

// clicks the send button if you hit the enter key while repl filed is focused
document.getElementById("repl-input").addEventListener("keyup", function(event) {
  if (event.code === "Enter"){
    event.preventDefault();
    document.getElementById("send").click();
  }
  else if (event.code === "ArrowUp"){
    event.preventDefault();

    //check to see that our index isnt at the end of commands sent
    if(serial.sentCommandBufferIndex == serial.sentCommandBuffer.length - 1){
      return false;
    }
    //update the buffer index
    serial.sentCommandBufferIndex++;
    //then drop that new element into the field
    document.getElementById("repl-input").value = serial.sentCommandBuffer[serial.sentCommandBufferIndex];

  }
  else if (event.code === "ArrowDown"){
    event.preventDefault();

    //check to see that our index isnt at the end of commands sent
    if(serial.sentCommandBufferIndex == 0){
      return false;
    }
    //update the buffer index
    serial.sentCommandBufferIndex--;
    //then drop that new element into the field
    document.getElementById("repl-input").value = serial.sentCommandBuffer[serial.sentCommandBufferIndex];

  }
});

//hide/reveal unicast fields if certain dropdowns are selected
document.getElementById("uni-command").addEventListener("change", () => {
  let dropdown = document.getElementById("uni-command").value;
  //first, we hide payload if we dont need it
  if(["0x01", "0x03", "0x06"].includes(dropdown)){
    document.getElementById("uni-payload").style.display = "none";
    document.getElementById("uni-payload-label").style.display = "none";
  }
  else {
    document.getElementById("uni-payload").style.display = "inline";
    document.getElementById("uni-payload-label").style.display = "inline";
  }
});



document.getElementById("connect").addEventListener("click", () => {
  serial.connect();
});

document.getElementById("send").addEventListener("click", () => {
  serial.sendRepl();
  clearReplInput();
});

document.getElementById("tmc").addEventListener("click", () => {
  serial.testTMC();
});

document.getElementById("vac").addEventListener("click", () => {
  serial.testVac();
});

// control pane
document.getElementById("left-air-on").addEventListener("click", () => {
  serial.leftAirOn();
});

document.getElementById("left-air-off").addEventListener("click", () => {
  serial.leftAirOff();
});

document.getElementById("right-air-on").addEventListener("click", () => {
  serial.rightAirOn();
});

document.getElementById("right-air-off").addEventListener("click", () => {
  serial.rightAirOff();
});

document.getElementById("ring-lights-on").addEventListener("click", () => {
  serial.ledOn();
});

document.getElementById("ring-lights-off").addEventListener("click", () => {
  serial.ledOff();
});

document.getElementById("left-vac").addEventListener("click", () => {
  serial.readLeftVac();
});

document.getElementById("right-vac").addEventListener("click", () => {
  serial.readRightVac();
});

document.getElementById("disable-steppers").addEventListener("click", () => {
  serial.disableSteppers();
});

document.getElementById("home-x").addEventListener("click", () => {
  serial.send(["G28 X"]);
});

document.getElementById("home-y").addEventListener("click", () => {
  serial.send(["G28 Y"]);
});

document.getElementById("home-z").addEventListener("click", () => {
  serial.send(["G28 Z"]);
});

document.getElementById("jog-max").addEventListener("click", () => {
  serial.send(["G0 X100 Y100"]);
});

document.getElementById("jog-min").addEventListener("click", () => {
  serial.send(["G0 X10 Y10"]);
});

document.getElementById("feeder-scan").addEventListener("click", () => {
  if (!serial.port?.writable){
    alert("Cannot write to port. Have you connected?");
    return false;
  }
  document.getElementById("found-feeders").style.display = "flex";
  document.getElementById("found-feeders").innerHTML = "";
  document.getElementById("feeder-scan").innerHTML="Scanning...";
  feeder.scan();
  //sendPacket(command, address, payload, payloadLength)
});

document.getElementById("uni-send").addEventListener("click", () => {
  feeder.sendUnicast();
  //sendPacket(command, address, payload, payloadLength)
});

document.getElementById("broad-send").addEventListener("click", () => {
  feeder.sendBroadcast();
  //sendPacket(command, address, payload, payloadLength)
});

document.getElementById("calc-calculate").addEventListener("click", () => {
  feeder.calculateUserCRC();
});

document.getElementById("program-slots").addEventListener("click", () => {
  feeder.programSlotsUtility();
});

document.getElementById("more-controls").addEventListener("click", () => {
  document.getElementById("unicast").style.display = "block";
  document.getElementById("broadcast").style.display = "block";
  document.getElementById("custom-packet").style.display = "block";
  document.getElementById("crc-tool").style.display = "block";
  document.getElementById("flash-at-fifty").style.display= "block";
});

document.getElementById("flash-fifty-button").addEventListener("click", () => {
  feeder.flashFifty();
});

//event delegation style listener for the feeder parent div, handling feeding and such from the parent
// https://davidwalsh.name/event-delegate
document.getElementById("found-feeders").addEventListener("click", function(e) {
	// e.target is the clicked element!
  let clickedElement = e.target;
	// If it was a list item
	if(clickedElement.className.split(' ').includes("identify") && clickedElement.nodeName == "BUTTON") {
		// List item found!  Output the ID!
    let foundFeederDiv = clickedElement.parentElement;

    let uuid = foundFeederDiv.getElementsByTagName('H4')[0].innerHTML;

    uuid = feeder.hexStringToIntArray(uuid);

    feeder.sendPacket(commands.IDENTIFY_FEEDER, 0xFF, uuid);
	}
  else if(clickedElement.className.split(' ').includes("feed") && clickedElement.nodeName == "BUTTON"){
    let foundFeederDiv = clickedElement.parentElement;

    let addr = foundFeederDiv.getElementsByTagName('H3')[0].innerHTML;

    addr = parseInt(addr);

    feeder.sendPacket(commands.MOVE_FEED_FORWARD, addr, 0x28);
  }
});


