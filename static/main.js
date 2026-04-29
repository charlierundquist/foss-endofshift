const DB_NAME = "apv_foss_endofshiftform_indexeddb"
const DB_VERSION = 1
const DB_STORE_NAME = "families"

var db

function openDB(fromIframe = false) {
    console.log("openDb ...");
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
        // Equal to: db = req.result;
        db = this.result;
        console.log("openDb DONE");

        if (fromIframe) {
            addFamily("google.com", "Book", 765638)
        }

    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('freestylelink', 'freestylelink', { unique: false });
      store.createIndex('famil-name', 'familyname', { unique: false });
      store.createIndex('phonenumber', 'phonenumber', { unique: false });
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

function addFamily(freestyle_link, family_name, phone_number) {
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    let obj = {'freestylelink': freestyle_link, 'familyname': family_name, 'phonenumber': phone_number}

    var req;

    try {
        req = store.add(obj)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        console.log("sucessfully added family")
    }

    req.onerror = () => {
        console.error("addFamily error", this.error)
    }
}

function getAllFamilies(){
    let familyList = document.createElement("div")

    let store = getObjectStore(DB_STORE_NAME, "readonly")

    let req = store.openCursor()

    req.onsuccess = (event) => {
        const cursor = event.target.result
        if(cursor){
            console.log(cursor.key + ": " + cursor.value.familyname)
            let familyDiv = document.createElement("ul")

            let linkDiv = document.createElement("li")
            linkDiv.innerText = cursor.value.freestylelink

            let nameDiv = document.createElement("li")
            nameDiv.innerText = cursor.value.familyname

            let phoneDiv = document.createElement("li")
            phoneDiv.innerText = cursor.value.phonenumber

            familyDiv.appendChild(linkDiv)
            familyDiv.appendChild(nameDiv)
            familyDiv.appendChild(phoneDiv)

            familyList.appendChild(familyDiv)
            cursor.continue()
        } else {
            console.log("no more entries")
        }

        document.getElementById("familyList").innerHTML = familyList.outerHTML
    }

    req.onerror = (event) => {
        console.log("error")
    }
}