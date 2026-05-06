const DB_NAME = "apv_foss_endofshiftform_indexeddb"
const DB_VERSION = 2
const DB_STORE_NAME = "endofshiftnotes"

var db

function openDB() {
    console.log("openDb ...");
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
        // Equal to: db = req.result;
        db = this.result;
        console.log("openDb DONE");

    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('clipboardstring', 'clipboardstring', { unique: false });
      store.createIndex('notes', 'notes', { unique: false });
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
        displayActionSuccess("Store cleared");
        displayPubList(store);
    };
    req.onerror = function (evt) {
        console.error("clearObjectStore:", evt.target.errorCode);
        displayActionFailure(this.error);
    };
}

function addNote(clipboardString, notes) {
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    let obj = {'clipboardstring': clipboardString, 'notes': notes}

    var req;

    try {
        req = store.add(obj)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        console.log("sucessfully added note")
    }

    req.onerror = () => {
        console.error("addNote error", this.error)
    }
}

function getAllNotes(){
    let notesList = document.createElement("div")

    let store = getObjectStore(DB_STORE_NAME, "readonly")

    let req = store.openCursor()

    req.onsuccess = (event) => {
        const cursor = event.target.result
        if(cursor){
            console.log(cursor.key + ": " + cursor.value.familyname)
           
            cursor.continue()
        } else {
            console.log("no more entries")
        }

        document.getElementById("notesList").innerHTML = notesList.outerHTML
    }

    req.onerror = (event) => {
        console.log("error")
    }
}