const DB_NAME = "apv_foss_familyswimentries_indexeddb"
const DB_VERSION = 2
const DB_STORE_NAME = "familyswimentries"

var db

function openDB() {
    console.log("openDb(familyswim) ...");
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
        // Equal to: db = req.result;
        db = this.result;
        console.log("openDb(familyswim) DONE");
        getAllEntries()

    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('date', 'date', { unique: false });
      store.createIndex('phonenumber', 'phonenumber', { unique: false });
      store.createIndex('emailaddress', 'emailaddress', { unique: false });
      store.createIndex('parentname', 'parentname', { unique: false });
      store.createIndex('attendancenumber', 'attendancenumber', { unique: false });
    };
}

function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}

function clearObjectStore() {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.clear();
    req.onsuccess = function(evt) {
        getAllNotes()
    };
    req.onerror = function (evt) {
        console.error("clearObjectStore:", evt.target.errorCode);
    };
}

function clearAllEntries() {
    clearObjectStore()
}

function addEntry(date, phonenumber, emailaddress, parentname, attendancenumber) {
    
    // validate info

    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    let obj = {
        'date': date,
        'phonenumber': phonenumber,
        'emailaddress': emailaddress,
        'parentname': parentname,
        'attendancenumber': attendancenumber
    }

    var req;

    try {
        req = store.add(obj)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        getAllEntries()
    }

    req.onerror = () => {
        console.error("addEntry error", this.error)
    }
}

function updateEntry(data){
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    var req;

    try {
        req = store.put(data)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        getAllEntries()
    }

    req.onerror = () => {
        console.error("updateEntry error", this.error)
    }
}

function deleteEntry(data){
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    var req
    
    try {
        req = store.delete(data.id)
    } catch (error) {
        throw error
    }

    req.onsuccess = () => {
        getAllEntries()
    }

    req.onerror = () => {
        console.error("deleteEntry error", this.error)
    }
}

function getAllEntries(){
    
    // update dom

    let store = getObjectStore(DB_STORE_NAME, "readonly")

    let req = store.openCursor()

    req.onsuccess = (event) => {
        const cursor = event.target.result
        if(cursor){

            console.log(cursor.value)
            
            cursor.continue()
        }
    }

    req.onerror = (event) => {
        console.log("error")
    }
}

function prepareEntry(data){
    let resultContainer = document.getElementById("prepareEntry")

    const parentName = data.parentName
    const phoneNumber = data.phoneNumber
    const emailAddress = data.emailAddress
    let date = ""
    let attendenceNumber = ""

    const dates = ["June 6th", "June 13th"]

    dates.map(date => {
        let newDatePicker = document.createElement("button")
        newDatePicker.innerHTML = date
        newDatePicker.onclick = () => {
            resultContainer.dispatchEvent(new CustomEvent("datechosen", {detail: {date:date}}));
            resultContainer.setAttribute("date", date);
        }
        resultContainer.appendChild(newDatePicker)
    })

    resultContainer.addEventListener("datechosen", (e) => {
        date = e.detail.date
        let me = e.target
        me.innerHTML = ""
        
        let parentCounter = document.createElement("div")
        parentCounter.style.gridTemplateColumns = "1fr 1fr"
        parentCounter.style.gridTemplateRows = "1fr 1fr"
        parentCounter.style.display = "grid"

        let pNumber = document.createElement("div")
        pNumber.innerHTML = "1"
        pNumber.style.gridArea = "1 / 1 / 3 / 2"
        parentCounter.appendChild(pNumber)

        let pUpButton = document.createElement("button")
        pUpButton.innerHTML = "/\\"
        pUpButton.style.gridArea = "1 / 2 / 2 / 3"
        pUpButton.onclick = () => {
            let currentNumber = parseInt(pNumber.innerHTML)
            let newNumber = (currentNumber + 1) % 6
            if(newNumber === 0) newNumber = 1
            pNumber.innerHTML = newNumber
        }
        parentCounter.appendChild(pUpButton)

        let pDownButton = document.createElement("button")
        pDownButton.innerHTML = "\\/"
        pDownButton.style.gridArea = "2 / 2 / 3 / 3"
        pDownButton.onclick = () => {
            let currentNumber = parseInt(pNumber.innerHTML)
            let newNumber = (currentNumber - 1) % 6
            if(newNumber === 0) newNumber = 5
            pNumber.innerHTML = newNumber
        }
        parentCounter.appendChild(pDownButton)

        let childCounter = document.createElement("div")
        childCounter.style.gridTemplateColumns = "1fr 1fr"
        childCounter.style.gridTemplateRows = "1fr 1fr"
        childCounter.style.display = "grid"

        let cNumber = document.createElement("div")
        cNumber.innerHTML = "1"
        cNumber.style.gridArea = "1 / 1 / 3 / 2"
        childCounter.appendChild(cNumber)

        let cUpButton = document.createElement("button")
        cUpButton.innerHTML = "/\\"
        cUpButton.style.gridArea = "1 / 2 / 2 / 3"
        cUpButton.onclick = () => {
            let currentNumber = parseInt(cNumber.innerHTML)
            let newNumber = (currentNumber + 1) % 6
            if(newNumber === 0) newNumber = 1
            cNumber.innerHTML = newNumber
        }
        childCounter.appendChild(cUpButton)

        let cDownButton = document.createElement("button")
        cDownButton.innerHTML = "\\/"
        cDownButton.style.gridArea = "2 / 2 / 3 / 3"
        cDownButton.onclick = () => {
            let currentNumber = parseInt(cNumber.innerHTML)
            let newNumber = (currentNumber - 1) % 6
            if(newNumber === 0) newNumber = 5
            cNumber.innerHTML = newNumber
        }
        childCounter.appendChild(cDownButton)

        let submitButton = document.createElement("button")
        submitButton.innerHTML = "submit"
        submitButton.onclick = () => {
            let parentCount = parseInt(pNumber.innerHTML)
            let childCount = parseInt(cNumber.innerHTML)
            attendenceNumber = parentCount + "&" + childCount

            addEntry(date, phoneNumber, emailAddress, parentName, attendenceNumber)
        }

        me.appendChild(parentCounter)
        me.appendChild(childCounter)
        me.appendChild(submitButton)
    })
}