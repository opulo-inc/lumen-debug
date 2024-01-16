import './style.css'

class serialManager {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.port;

    this.receiveBuffer = [];

    document.getElementById("connect").addEventListener("click", () => {
      this.connect();
    });

    document.getElementById("send").addEventListener("click", () => {
      this.sendRepl();
    });
    
    document.getElementById("tmc").addEventListener("click", () => {
      this.testTMC();
    });

    document.getElementById("vac").addEventListener("click", () => {
      this.testVac();
    });
  }

  // drops and returns last element from buffer
  getNextBufferLine() {
    let nextLine = this.receiveBuffer.shift();
    return nextLine
  }

  async clearBuffer(){
    while(this.receiveBuffer.length > 0){
      this.receiveBuffer.shift();
    }
  }

  delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

  async connect() {
    if (!navigator.serial) return false
      const usbVendorId = 0x0483;
      this.port = await navigator.serial.requestPort({ filters: [{ usbVendorId }] })    
      console.log("Port Selected.")
  
      await this.port.open({
        baudRate: 115200,
        bufferSize: 255,
        dataBits: 8,
        flowControl: "none",
        parity: "none",
        stopBits: 1
      })
  
      console.log("Port Opened.")
      // const { clearToSend, dataCarrierDetect, dataSetReady, ringIndicator} = await this.port.getSignals()
      // console.log({ clearToSend, dataCarrierDetect, dataSetReady, ringIndicator})
      this.listen()
  
  
      document.querySelector("#connect").style.background = 'green';
      document.querySelector("#connect").style.color = 'white';
      document.querySelector("#connect").innerHTML = 'Connected'; 
      return true
  }
  
  // this needs to listen to marlin constantly
  // it comes in randomly, so we have to filter by newlines an add
  // to buffer based on the newlines
  async listen() {
    while (this.port?.readable) {
      console.log("Port is readable: Starting to listen.")
      let metabuffer = ""
      let consoleDiv = document.getElementById("console");
      const reader = this.port.readable.getReader()
      try {
        while (true) {
          console.log("reading");
          const { value, done } = await reader.read()
          if (done) {
            // |reader| has been canceled.
            console.log("closing reader");
        
            break;
          }
          
          const decoded = this.decoder.decode(value)
          metabuffer = metabuffer.concat(decoded);

          while(metabuffer.indexOf("\n") != -1){
            let splitted = metabuffer.split('\n');
            // console.log(splitted)
            this.receiveBuffer.push(splitted[0])

            console.log(this.receiveBuffer.length)

            let newConsoleEntry = document.createElement('p')
            let timestamp = new Date().toISOString();
            
            newConsoleEntry.innerHTML = timestamp + " - " + splitted[0] + '\n';
            consoleDiv.appendChild(newConsoleEntry)
            
            consoleDiv.scrollTop = consoleDiv.scrollHeight;

            metabuffer = metabuffer.split('\n').slice(1).join('\n');
          }
          
        }
      } catch (error) {
        console.error('reading error', error)
      } finally {
        reader.releaseLock()
      }
    }
  }
  
  async send(commandArray) {
    if (this.port?.writable) {
      const writer = await this.port.writable.getWriter()
      for (const element of commandArray) {
        console.log("Sending Line: " + element)
        await writer.write(this.encoder.encode(element + "\n"))
      }
      writer.releaseLock()
    }
  }

  async sendRepl() {
    let command = [document.querySelector("#repl-input").value];
    this.send(command);

  }
  // tests

  async testTMC(){
    const commandArray = [
      "M122"
    ]

    //clean out receive buffer
    

    //send command array
    this.send(commandArray);

    //check receieve buffer


    //alert user

    //set button accordingly

  }

  async testVac(){
    const commandArrayLeft = [
      "M260 A112 B1 S1",
      "M260 A109",
      "M260 B48",
      "M260 B10",
      "M260 S1"
    ]

    const commandArrayRight = [
      "M260 A112 B2 S1",
      "M260 A109",
      "M260 B48",
      "M260 B10",
      "M260 S1"
    ]

    const delayVal = 20;

    this.clearBuffer();

    let msb, csb, lsb;
    const regex = new RegExp('data:(..)');

    //send command array
    await this.send(commandArrayLeft);

    await this.send(["M260 A109 B6 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        msb = currLine.match("data:(..)")[1];
        break
      }
    }

    this.clearBuffer();
    
    await this.send(["M260 A109 B7 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        csb = currLine.match("data:(..)")[1];
        break
      }
    }

    this.clearBuffer();
    
    await this.send(["M260 A109 B8 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        lsb = currLine.match("data:(..)")[1];
        break
      }
    }

    let leftVal = parseInt(msb+csb+lsb, 16);

    console.log(leftVal);

    // NOW RIGHT SENSOR

    this.clearBuffer();

    //send command array
    await this.send(commandArrayRight);

    await this.send(["M260 A109 B6 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        msb = currLine.match("data:(..)")[1];
        break
      }
    }

    this.clearBuffer();
    
    await this.send(["M260 A109 B7 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        csb = currLine.match("data:(..)")[1];
        break
      }
    }

    this.clearBuffer();
    
    await this.send(["M260 A109 B8 S1"]);
    await this.send(["M261 A109 B1 S1"]);
    await this.delay(delayVal);

    console.log("current buffer length: ", this.receiveBuffer.length)
    for (var i=0, x=this.receiveBuffer.length; i<x; i++) {
      let currLine = this.receiveBuffer[i];
      let result = regex.test(currLine);
      if(result){
        lsb = currLine.match("data:(..)")[1];
        break
      }
    }

    let rightVal = parseInt(msb+csb+lsb, 16);

    console.log(rightVal);

    console.log(leftVal, rightVal)

    alert("Left Sensor: " + leftVal + ", Right Sensor: " + rightVal);

    
    //alert user

    //set button accordingly

  }
  

}



let serial = new serialManager();




