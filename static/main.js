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
        getAllNotes()

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
    if (clipboardString.split("___")[0] !== "FAMILYINFO"){
        alert("Couldn't find the family info, press the plus button again")
        return
    }

    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    let obj = {'clipboardstring': clipboardString, 'notes': notes}

    var req;

    try {
        req = store.add(obj)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        getAllNotes()
    }

    req.onerror = () => {
        console.error("addNote error", this.error)
    }
}

function updateNote(data){
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    var req;

    try {
        req = store.put(data)
    } catch (error) {
        throw error
    }

    req.onsuccess = (event) => {
        getAllNotes()
    }

    req.onerror = () => {
        console.error("updateNote error", this.error)
    }
}

function deleteNote(data){
    let store = getObjectStore(DB_STORE_NAME, "readwrite")

    var req
    
    try {
        req = store.delete(data.id)
    } catch (error) {
        throw error
    }

    req.onsuccess = () => {
        getAllNotes()
    }

    req.onerror = () => {
        console.error("deleteNote error", this.error)
    }
}

function getAllNotes(){
    let notesList = document.createElement("div")

    let store = getObjectStore(DB_STORE_NAME, "readonly")

    let req = store.openCursor()

    req.onsuccess = (event) => {
        const cursor = event.target.result
        if(cursor){

            let newNote = renderNote(cursor.value)
            notesList.appendChild(newNote)
            
            cursor.continue()
        }

        let resultDiv = document.getElementById("getAllNotesResult")
        resultDiv.innerHTML = ""
        resultDiv.appendChild(notesList)
    }

    req.onerror = (event) => {
        console.log("error")
    }
}

async function addNoteFromClipboard() {

    let clipboardString = await navigator.clipboard.readText()

    addNote(clipboardString, "")
    getAllNotes()

}

function renderNote(data){
    let newNoteDiv = document.createElement("div")
    newNoteDiv.setAttribute("noteID", data.id)
    newNoteDiv.setAttribute("clipboardstring", data.clipboardstring)
    newNoteDiv.setAttribute("notes", data.notes)
    let newInfoCol = document.createElement("div")
    let newNotesCol = document.createElement("div")
    
    let split = data.clipboardstring.split("___")

    const freestyleLink = split[1]
    const familyName = split[2]
    const phoneNumber = split[3]
    const childrenList = split[4]

    let deleteButton = document.createElement("button")
    deleteButton.innerHTML = "x"
    deleteButton.onclick = () => {
        deleteNote(data)
    }
    newNoteDiv.appendChild(deleteButton)

    let linkRow = document.createElement("p")
    let linkDiv = document.createElement("a")
    linkDiv.setAttribute("href", freestyleLink)
    linkDiv.setAttribute("target", "_blank")
    linkDiv.innerHTML = "View in Freestyle"
    linkRow.appendChild(linkDiv)
    newNoteDiv.appendChild(linkRow)


    let nameRow = document.createElement("p")
    let nameDiv = document.createElement("span")
    nameDiv.innerHTML = familyName
    nameRow.appendChild(nameDiv)
    newNoteDiv.appendChild(nameRow)


    let phoneRow = document.createElement("p")
    let phoneDiv = document.createElement("span")
    phoneDiv.innerHTML = phoneNumber
    phoneRow.appendChild(phoneDiv)
    newNoteDiv.appendChild(phoneRow)


    let childrenListSplit = childrenList.split(":::")
    childrenListSplit.map((child, i) => {

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

        newNoteDiv.appendChild(newChildParent)
    })

    newNoteDiv.appendChild(newInfoCol)
    newNoteDiv.appendChild(renderNotesBox(data))

    return newNoteDiv
}

function renderNotesBox(data){

    let notesParent = document.createElement("div")
    if(data.notes === ""){
        let textBox = document.createElement("textarea")
        let submitButton = document.createElement("button")
        submitButton.innerHTML = "Add Note"
        submitButton.onclick = () => {
            data.notes = textBox.value
            updateNote(data)
            getAllNotes()
        }
        notesParent.appendChild(textBox)
        notesParent.appendChild(submitButton)
        return notesParent
    }

    let notesDiv = document.createElement("p")
    notesDiv.innerHTML = data.notes
    let editButton = document.createElement("button")
    editButton.innerHTML = "Edit"
    editButton.onclick = () => {
        let filledTextBox = document.createElement("textarea")
        filledTextBox.innerHTML = data.notes
        let submitEditButton = document.createElement("button")
        submitEditButton.innerHTML = "Add Note"
        submitEditButton.onclick = () => {
            console.log(filledTextBox.value)
            data.notes = filledTextBox.value
            updateNote(data)
            getAllNotes()
        }
        notesDiv.remove()
        editButton.remove()
        notesParent.appendChild(filledTextBox)
        notesParent.appendChild(submitEditButton)
    }

    notesParent.appendChild(notesDiv)
    notesParent.appendChild(editButton)

    return notesParent

}