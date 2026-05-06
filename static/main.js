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
            console.log(cursor)

            let newNoteDiv = document.createElement("p")
            newNoteDiv.innerHTML = cursor.value.clipboardstring + " | " + cursor.value.notes
            notesList.appendChild(newNoteDiv)
            cursor.continue()
        } else {
            console.log("no more entries")
        }

        document.getElementById("getAllNotesResult").innerHTML = notesList.outerHTML
    }

    req.onerror = (event) => {
        console.log("error")
    }
}

async function parseClipboardString() {

            let text = await navigator.clipboard.readText()
            let split = text.split("___")

            const freestyleLink = split[1]
            const familyName = split[2]
            const phoneNumber = split[3]
            const childrenList = split[4]

            let newNoteParent = document.createElement("div")
            let infoCol = document.createElement("div")

            let linkRow = document.createElement("p")
            let linkDiv = document.createElement("a")
            linkDiv.setAttribute("href", freestyleLink)
            linkDiv.setAttribute("target", "_blank")
            linkDiv.innerHTML = "View in Freestyle"
            linkRow.appendChild(linkDiv)
            infoCol.appendChild(linkRow)


            let nameRow = document.createElement("p")
            let nameDiv = document.createElement("span")
            nameDiv.innerHTML = familyName
            nameRow.appendChild(nameDiv)
            infoCol.appendChild(nameRow)


            let phoneRow = document.createElement("p")
            let phoneDiv = document.createElement("span")
            phoneDiv.innerHTML = phoneNumber
            phoneRow.appendChild(phoneDiv)
            infoCol.appendChild(phoneRow)


            let childrenListSplit = childrenList.split(":::")
            console.log(childrenListSplit)
            childrenListSplit.map((child, i) => {
                console.log(child)

                if(child === "") return

                let newChildParent = document.createElement("div")
                newChildParent.style.marginLeft = "1rem"

                let classSplit = child.split("<CLASS>")
                let cName = classSplit[0]

                let cNameRow = document.createElement("p")
                let cNameDiv = document.createElement("span")
                cNameDiv.innerHTML = cName
                cNameRow.appendChild(cNameDiv)
                newChildParent.appendChild(cNameRow)

                if (classSplit.length > 1){
                    let classInfo = classSplit[1].split("/")

                    let classLevel = classInfo[1]
                    let classDay = classInfo[2]
                    let classTime = classInfo[3]
    
                    let classRow = document.createElement("p")
    
                    let levelDiv = document.createElement("span")
                    levelDiv.innerHTML = classLevel + " | "
                    classRow.appendChild(levelDiv)
    
                    let dayDiv = document.createElement("span")
                    dayDiv.innerHTML = classDay + " | "
                    classRow.appendChild(dayDiv)
    
                    let timeDiv = document.createElement("span")
                    timeDiv.innerHTML = classTime
                    classRow.appendChild(timeDiv)

                    newChildParent.appendChild(classRow)

                }

                infoCol.appendChild(newChildParent)
            })

            let notesList = document.getElementById("notesList")
            newNoteParent.appendChild(infoCol)

            let notesCol = document.createElement("div")
            let noteBox = document.createElement("textarea")
            let submitNoteButton = document.createElement("button")
            submitNoteButton.innerHTML = "Add Note"
            submitNoteButton.onclick = () => {
                notesCol.innerHTML = noteBox.value
                addNote(text, noteBox.value)
            }
            notesCol.appendChild(noteBox)
            notesCol.appendChild(submitNoteButton)
            newNoteParent.appendChild(notesCol)

            notesList.appendChild(newNoteParent)

        }