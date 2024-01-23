export class modalManager {

    constructor() {
        this.modalObject = document.getElementById("modal");
        this.overlay = document.getElementById("overlay");

        this.modalTitle = document.getElementById("modal-title");
        this.modalContent = document.getElementById("modal-content");
        this.modalClose = document.getElementById("modal-close");

        this.modalOK = document.getElementById("modal-ok");

        this.receivedInput = undefined;
    }

    timeout = async ms => new Promise(res => setTimeout(res, ms));

    hide() {
        this.modalObject.style.display = "none";
        this.overlay.style.display = "none";
    }

    async show(title, contents) {
        this.modalTitle.innerHTML = title;
        this.modalContent.innerHTML = contents;

        this.modalObject.style.display = "flex";
        this.overlay.style.display = "block";

        this.modalOK.focus();

        let response = await this.waitForUserSelection();

        return response;
        
    }

    async waitForUserSelection() {
        //wait for a buttonpress in another function to ste received input to something other than -1
        while (this.receivedInput === undefined) await this.timeout(50);

        //grab value
        let userValue = this.receivedInput;
        //reset for the next thing
        this.receivedInput = undefined;

        return userValue;

    }

}