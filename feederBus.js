import {commands} from './commands.js'
import feederIcon from './public/feeder-icon.png'
// v1
// 1. a field for sending unicast has a to address, the command you want to send, and if a feed command, a distance payload field
// 2. a field for broadcast, space for uuid payload, plus program feeder floor has an address field
// 3. an arbitrary packet sender, that does crc calc, from address, but the rest is you
// 4. crc calc tool.

// v2
// #1 above is replaced with scanning and a box pops up for each found feeder. all the unicast commands now become buttons and fields in each one of those boxes.
// 2, 3, and 4 are all the same

export class feederBus {

    // fake enum in the structure of [command_byte, unicast/broadcast, send payload length]
    
    constructor(serialManager) {
      this.serial = serialManager;
      this.packetID = 0x00;
      this.feeders = [];

    }

    beautifyResponse(dataArray){
        let payloadString = "";
        let payload = dataArray.slice(6);
        for(let i=0; i<payload.length; i++){
          payloadString = payloadString + this.intToHexString(payload[i]) + " ";
        }
        alert("From: " + this.intToHexString(dataArray[1]) + "\nPacketID: " + this.intToHexString(dataArray[2]) + "\nPayload Length: " + this.intToHexString(dataArray[3]) + "\nChecksum: " + this.intToHexString(dataArray[4]) + "\nStatus: " + this.intToHexString(dataArray[5]) + "\nPayload: " + payloadString);
    }

    intToHexString(number){
        let convert = number.toString(16).toUpperCase();
        if(convert.length == 1){
            convert = "0".concat(convert);
        }
        return "0x".concat(convert);
    }

    calcCRC(data){
      let crc = 0;
      for(var i = 0; i< data.length;i++){
        crc = crc ^ (data[i] << 8);
        for(let j = 0; j < 8; j++){
          if ((crc & 0x8000) != 0) {
            crc = crc ^ (0x1070 << 3);
          }
          crc <<= 1;
        }
      }
      return (crc >> 8) & 0xFF;
    }

    hexStringToIntArray(hexString){
        let intArray = [];
        console.log("string: ", hexString);

        for(let i = 0; i<(hexString.length/2);i++){
            let index = (i)*2;
            let sliced = hexString.slice(index, index+2);
            let hexed = parseInt(sliced, 16);
            intArray[i] = hexed;
        }
        return intArray;
    }

    validatePacketCrc(intArray){
        // grabbing received crc
        let receivedCrc = intArray[4];

        //making copy of the array without crc
        let crcChecker = intArray.slice(0,4).concat(intArray.slice(5));
        

        //calculating based on remaining data
        let calculatedCrc = this.calcCRC(crcChecker);
        if(receivedCrc != calculatedCrc){
            console.log("Received packet had CRC mismatch.");
            return false;
        }
        return true;
    }

    intArrayToHexString(intArray){
      let finalString = "";
      for(let i = 0; i<intArray.length; i++){
        let hexString = intArray[i].toString(16).toUpperCase();
        if(hexString.length == 1){
          hexString = "0".concat(hexString);
        }
        finalString = finalString.concat(hexString);
      }
      return finalString;

    }
  
    //calculates crc, splices it in, and converts it to a gcode string
    getGcodeFromPacketAndPayloadArray(dataArray){

      //calc crc is destructive, so we make a copy of our data
      let dataToSend = dataArray;
      let crc = this.calcCRC(dataArray);
    
      // splices in crc byte at location 4 without replacing
      dataToSend.splice(4, 0, crc);
      console.log("finalArray: ", dataToSend);

      let dataString = this.intArrayToHexString(dataToSend);
      let gcodeString = "M485 ".concat(dataString);

      return gcodeString;
    }

    processResponse_GET_ID(response, sentPacketID, sentAddress){

        //check packetid
        if(response[2] != sentPacketID){
            console.log("packetids dont match");
            return false;
        }

        if(response[1] != sentAddress){
            console.log("address doesnt matchr");
            return false;
        }

        response.splice(0, 5);

        console.log(response);

        let uuidString = "";
        for (let i=0; i<response.length; i++){
            let hex = response[i].toString(16);
            if(hex.length == 1){
                hex = "0".concat(hex);
            }
            uuidString = uuidString.concat(hex.toUpperCase());
        }

        console.log("UUID: ", uuidString);

    }
  
    async sendPacket(command, address, payload){
        // checking we have a recipient address if we need one
        if (command[1] == "UNICAST" && address == ""){
            console.log("Error: Selected command requires address.");
            return false;
        }
    
        // checking we have a payload if we need one
        if (command[2] > 1 && payload === undefined){
            console.log("Error: Selected command requires payload.");
            return false;
        }
    
        //building initial header. still requires crc.
        let header;
        //if payload length can vary, our datatype has 0 in the field and we take the length of the payload passed plus one for the command
        if (command[2] == 0){
            console.log("first one")
            console.log(payload.length);
            header = [address, 0x00, this.packetID, payload.length + 1];

            
        }
        //if our payload length is known, we just grab from the datatype
        else{
            header = [address, 0x00, this.packetID, command[2]];
        }

        console.log(header, " header");

        //ADDING PAYLOAD

        // we always add the command id
        let data = header.concat([command[0]]);
    
        //if there's more payload than just the command id, or it's defined from payload.length we add it in
        if(command[2] > 1 || command[2] == 0){
            data = data.concat(payload);
        }

        //convert to gcode line
        let sendableString = this.getGcodeFromPacketAndPayloadArray(data);

        // wipe incoming buffer
        this.serial.clearBuffer();

        // send string
        await this.serial.send([sendableString]);

        //todo convert this to waiting for OK in receiveBuffer instead of just waiting
        await this.serial.delay(200);

        //saving sent packetid
        let sentPacketID = this.packetID;

        //increment packetid, and wrap back to zero if it's
        if(this.packetID < 255){
            this.packetID++;
        }
        else{
            this.packetID = 0;
        }
        

        // find response in receiveBuffer
        let response;
        const regex = new RegExp('rs485-reply:');
        for (let i=0, x=this.serial.receiveBuffer.length; i<x; i++) {
            let currLine = this.serial.receiveBuffer[i];
            let matched = regex.test(currLine);
            if(matched){
                response = currLine.match("rs485-reply: (.*)")[1];
                break
            }
        }

        if(response == "TIMEOUT"){
            console.log("Received TIMEOUT.");
            return false;
        }

        //converts response to array
        let responseArray = this.hexStringToIntArray(response);

        //checking response is valid crc
        if(!this.validatePacketCrc(responseArray)){
            return false;
        }

        //checking response is the same packetid
        if(responseArray[2] != sentPacketID){
            console.log("Returning packet ID mismatched sent packet ID.")
            return false;
        }


        return responseArray;
        
    }

    async sendUnicast(){
        //first we have hella values to get from the dom
        let toAddress = document.getElementById("uni-to").value;
        let command = document.getElementById("uni-command").value;
        let payload = document.getElementById("uni-payload").value;

        toAddress = parseInt(toAddress);
        payload = this.hexStringToIntArray(payload);

        let response;

        if(command == 0x01){
            response = await this.sendPacket(commands.GET_ID, toAddress);
        }
        else if(command == 0x02){
            response = await this.sendPacket(commands.INITIALIZE, toAddress, payload);
        }
        else if(command == 0x03){
            response = await this.sendPacket(commands.GET_VERSION, toAddress);
        }
        else if(command == 0x04){
            response = await this.sendPacket(commands.MOVE_FEED_FORWARD, toAddress, payload);
        }
        else if(command == 0x05){
            response = await this.sendPacket(commands.MOVE_FEED_BACKWARD, toAddress, payload);
        }
        else if(command == 0x06){
            response = await this.sendPacket(commands.MOVE_FEED_STATUS, toAddress);
        }
        else if(command == 0xbf){
            console.log(payload);
            response = await this.sendPacket(commands.VENDOR_OPTIONS, toAddress, payload);
        }

        if(response != false){
            this.beautifyResponse(response);
        }
        else{
            alert("We did not receive a valid packet.");
        }
        

    }

    async sendBroadcast(){
        //first we have hella values to get from the dom
        let programAddress = document.getElementById("broad-program-address").value;
        let command = document.getElementById("broad-command").value;
        let uuid = document.getElementById("broad-uuid").value;

        programAddress = parseInt(programAddress);
        uuid = this.hexStringToIntArray(uuid);

        let response;

        if(command == 0xc0){
            response =  await this.sendPacket(commands.GET_FEEDER_ADDRESS, 255, uuid);
        }
        else if(command == 0xc1){
            response = await this.sendPacket(commands.IDENTIFY_FEEDER, 255, uuid);
        }
        else if(command == 0xc2){
            uuid.push(programAddress);
            response = await this.sendPacket(commands.PROGRAM_FEEDER_FLOOR, 255, uuid);
        }
        else if(command == 0xc3){
            response = await this.sendPacket(commands.UNINITIALIZED_FEEDERS_RESPOND, 255);
        }

        if(response != false){
            this.beautifyResponse(response);
        }
        else{
            alert("We did not receive a valid packet.");
        }

    }

    async customPacket(){
        let to = parseInt(document.getElementById("custom-to").value);
        let command = parseInt(document.getElementById("calc-command").value);
        let payload = parseInt(document.getElementById("calc-payload").value);

        if(to === NaN || command === NaN){
            alert("Please make sure you've entered at least a To Address and a Command");
            return false;
        }

        let response;
        
        if (payload == ""){
            response = await this.sendPacket(command, to);
        }
        else{
            response = await this.sendPacket(command, to, payload);
        }

        if(response != false){
            this.beautifyResponse(response);
        }
        else{
            alert("We did not receive a valid packet.");
        }
        
    }

    async calculateUserCRC(){
        //first we have hella values to get from the dom
        let to = parseInt(document.getElementById("calc-to").value);
        let from = parseInt(document.getElementById("calc-from").value);
        let packetid = parseInt(document.getElementById("calc-packetid").value);
        let payloadLength = parseInt(document.getElementById("calc-payload-length").value);
        let command = parseInt(document.getElementById("calc-command").value);
        let payload = this.hexStringToIntArray(document.getElementById("calc-payload").value);

        let data = [to, from, packetid, payloadLength, command];
        data = data.concat(payload);

        let crc = this.calcCRC(data);
        alert(crc);

    }

    async scan(){
        let maxAddress = 50; //254

        //main loop, checking every address
        for(let i=1;i<(maxAddress+1);i++){
            //first, we 0x01 get_id to see if somethigns there.
            let response = await this.sendPacket(commands.GET_ID, i)
            if(response != false){
                //we got somethin! is it an OK response?
                if(response[5] == 0){
                    //grab uuid
                    let uuid = response.slice(6)
                    
                    //send initialize with uuid
                    let initResponse = await this.sendPacket(commands.INITIALIZE, i, uuid);

                    if(initResponse[5] == 0){
                        console.log("found one at ", i);

                        uuid = this.intArrayToHexString(uuid);

                        let addr = i.toString();
                        
                        //add to dom
                        let newFeederDiv = document.createElement("div");

                        let feederImage = document.createElement("img");
                        feederImage.src = feederIcon;

                        let newAddress = document.createElement("H3");
                        let addressText = document.createTextNode(addr);
                        newAddress.appendChild(addressText);

                        let newUUID = document.createElement("H4");
                        let uuidText = document.createTextNode(uuid);
                        newUUID.appendChild(uuidText);

                        //identify button
                        let newButton = document.createElement("button");
                        let buttonText = document.createTextNode("Identify");
                        newButton.appendChild(buttonText);
                        newButton.classList.add("identify");

                        //feed button
                        let newFeed = document.createElement("button");
                        let feedText = document.createTextNode("Feed");
                        newFeed.appendChild(feedText);
                        newFeed.classList.add("feed");

                        newFeederDiv.appendChild(feederImage);
                        newFeederDiv.appendChild(newAddress);
                        newFeederDiv.appendChild(newUUID);
                        newFeederDiv.appendChild(newButton);
                        newFeederDiv.appendChild(newFeed);
                        newFeederDiv.classList.add("found-feeder")

                        let foundFeeders = document.getElementById("found-feeders");

                        foundFeeders.appendChild(newFeederDiv);
                        

                    }

                        
                }

                
            }

        }

        document.getElementById("feeder-scan").innerHTML="Scan";
    }

}
