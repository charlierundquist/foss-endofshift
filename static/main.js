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
        getAllNotes()
    };
    req.onerror = function (evt) {
        console.error("clearObjectStore:", evt.target.errorCode);
    };
}

function clearAllNotes() {
    clearObjectStore()
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
    let notesList = document.getElementById("getAllNotesResult")
    notesList.innerHTML = ""

    let store = getObjectStore(DB_STORE_NAME, "readonly")

    let req = store.openCursor()

    req.onsuccess = (event) => {
        const cursor = event.target.result
        if(cursor){

            let newNote = renderNote(cursor.value)
            notesList.appendChild(newNote)
            
            cursor.continue()
        }
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
    newNoteDiv.style.display = "flex"
    newNoteDiv.style.gap = "3rem"
    newNoteDiv.style.marginTop = "1rem"

    let col1 = document.createElement("div")
    let col2 = document.createElement("div")
    let col3 = document.createElement("div")
    
    let split = data.clipboardstring.split("___")

    const freestyleLink = split[1]
    const familyName = split[2]
    const phoneNumber = split[3]
    const childrenList = split[4]

    col1.style.display = "grid"
    col1.style.justifyContent = "center"
    let deleteButton = document.createElement("button")
    deleteButton.innerHTML = "x"
    deleteButton.style.height = "25px"
    deleteButton.style.width = "25px"
    deleteButton.onclick = () => {
        deleteNote(data)
    }
    col1.appendChild(deleteButton)
    
    let linkDiv = document.createElement("a")
    linkDiv.classList.add("button")
    linkDiv.style.height = "25px"
    linkDiv.style.width = "25px"
    linkDiv.style.textAlign = "center"
    linkDiv.style.padding = "0px"
    linkDiv.style.fontWeight = "normal"
    linkDiv.style.fontSize = "16px"
    linkDiv.setAttribute("href", freestyleLink)
    linkDiv.setAttribute("target", "_blank")
    linkDiv.innerHTML = "i"

    let mainInfoDiv = document.createElement("span")
    mainInfoDiv.style.display = "block"
    mainInfoDiv.style.fontSize = "20px"
    mainInfoDiv.style.fontWeight = "bold"
    mainInfoDiv.innerHTML = familyName + " | " + phoneNumber + " | " + linkDiv.outerHTML
    col2.appendChild(mainInfoDiv)
    col2.style.width = "fit-content"
    
    let childrenUL = document.createElement("ul")
    childrenUL.style.paddingLeft = "16px"
    childrenUL.style.marginBlock = "2px"
    let childrenListSplit = childrenList.split(":::")
    childrenListSplit.map((child, i) => {

        if(child === "") return

        let childLI = document.createElement("li")

        let classSplit = child.split("<CLASS>")
        let cName = classSplit[0]

        childLI.innerHTML = cName

        if (classSplit.length > 1){
            let classInfo = classSplit[1].split("/")

            let classLevel = classInfo[1]
            let classDay = classInfo[2]
            let classTime = classInfo[3]

            childLI.innerHTML += "  -  " + classLevel + " | " + classDay + " | " + classTime

        }

        childrenUL.appendChild(childLI)
    })
    col2.appendChild(childrenUL)

    col3.appendChild(renderNotesBox(data))

    newNoteDiv.appendChild(col1)
    newNoteDiv.appendChild(col2)
    newNoteDiv.appendChild(col3)

    return newNoteDiv
}

function renderNotesBox(data){

    let notesParent = document.createElement("div")
    notesParent.style.height = "100%"
    notesParent.style.width = "60ch"
    notesParent.style.placeContent = "center"
    if(data.notes === ""){
        let textBox = document.createElement("textarea")
        textBox.style.width = "100%"
        textBox.style.height = "100%"
        let submitButton = document.createElement("button")
        submitButton.innerHTML = "Add Note"
        submitButton.onclick = () => {
            data.notes = textBox.value
            updateNote(data)
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