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

            // update dom
            
            cursor.continue()
        }
    }

    req.onerror = (event) => {
        console.log("error")
    }
}

function prepareEntry(data){
    let resultContainer = document.getElementById("prepareEntry")

    const dates = ["June 6th", "June 13th"]

    dates.map(date => {
        let newDatePicker = document.createElement("button")
        newDatePicker.innerHTML = date
        newDatePicker.onclick = () => {
            resultContainer.dispatchEvent(new CustomEvent("datechosen", {detail: {date:date}}))
        }
        resultContainer.appendChild(newDatePicker)
    })

    resultContainer.addEventListener("datechosen", (e) => {
        console.log(e.detail.date)
    })
}