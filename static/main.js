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

}

function renderNote(data){
    let newNoteDiv = document.createElement("div")
    newNoteDiv.setAttribute("noteID", data.id)
    newNoteDiv.setAttribute("clipboardstring", data.clipboardstring)
    newNoteDiv.setAttribute("notes", data.notes)
    newNoteDiv.style.display = "flex"
    newNoteDiv.style.marginTop = "1rem"
    newNoteDiv.style.backgroundColor = "#bbb"
    newNoteDiv.style.borderRadius = "5px"

    let col1 = document.createElement("div")
    let col2 = document.createElement("div")
    let col3 = document.createElement("div")
    
    let split = data.clipboardstring.split("___")

    const freestyleLink = split[1]
    const familyName = split[2]
    const phoneNumber = split[3]
    const childrenList = split[4]

    col1.style.display = "grid"
    col1.style.alignContent = "center"
    let deleteButton = document.createElement("button")
    deleteButton.innerHTML = "x"
    deleteButton.style.height = "25px"
    deleteButton.style.width = "25px"
    deleteButton.style.marginInline = "0.5rem"
    deleteButton.style.backgroundColor = "transparent"
    deleteButton.style.border = "none"
    deleteButton.style.cursor = "pointer"
    deleteButton.style.fontSize = "1rem"
    deleteButton.onclick = () => {
        deleteNote(data)
    }
    col1.appendChild(deleteButton)
    
    let linkParentDiv = document.createElement("div")
    linkParentDiv.style.display = "inline-block"
    linkParentDiv.style.width = "20px"
    linkParentDiv.style.height = "20px"
    linkParentDiv.style.borderRadius = "100%"
    let linkDiv = document.createElement("a")
    linkDiv.classList.add("button")
    linkDiv.style.textAlign = "center"
    linkDiv.style.fontWeight = "normal"
    linkDiv.style.fontSize = "16px"
    linkDiv.style.borderRadius = "100%"
    linkDiv.setAttribute("href", freestyleLink)
    linkDiv.setAttribute("target", "_blank")
    linkDiv.innerHTML = "i"
    linkParentDiv.appendChild(linkDiv)

    let mainInfoDiv = document.createElement("div")
    mainInfoDiv.style.display = "flex"
    mainInfoDiv.style.gap = "0.5rem"
    mainInfoDiv.style.alignItems = "center"
    mainInfoDiv.style.fontSize = "20px"
    mainInfoDiv.style.padding = "0.5rem"
    mainInfoDiv.innerHTML = "<span>" + familyName + "</span>" + "<span style='border-right:1px solid black; width: 0px; transform:scaleY(0.75)'>&nbsp;</span>" + "<span style='font-size: 14px;'>" + phoneNumber + "</span>" + "<span style='border-right:1px solid black; width: 0px; transform:scaleY(0.75)'>&nbsp;</span>" + linkParentDiv.outerHTML
    col2.appendChild(mainInfoDiv)
    col2.style.width = "fit-content"
    col2.style.marginRight = "3rem"
    
    let childrenUL = document.createElement("ul")
    childrenUL.style.listStyle = "none"
    childrenUL.style.padding = "0.5rem 1rem"
    childrenUL.style.marginTop = "0px"
    childrenUL.style.marginBottom = "0.5rem"
    childrenUL.style.borderRadius = "5px"
    childrenUL.style.backgroundColor = "#ccc"
    let childrenListSplit = childrenList.split(":::")
    childrenListSplit.map((child, i) => {

        if(child === "") return

        let childLI = document.createElement("li")

        let classSplit = child.split("<CLASS>")
        let cName = classSplit[0]

        childLI.innerHTML = "<span>" + cName + "</span>"
        childLI.style.display = "flex"
        childLI.style.minWidth = "25ch"
        childLI.style.justifyContent = "space-between"

        if (classSplit.length > 1){
            let classInfo = classSplit[1].split("/")

            let classLevel = classInfo[1]
            let classDay = classInfo[2]
            let classTime = classInfo[3]

            childLI.innerHTML += "<span style='font-size:13px; align-self:end; margin-left:1rem;'>" + classLevel + " " + classDay + " " + classTime + "</span>"

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
    notesParent.classList.add("notesbox")
    notesParent.style.height = "100%"
    notesParent.style.minWidth = "80ch"
    notesParent.style.display = "flex"
    notesParent.style.gap = "1rem"
    notesParent.style.justifyContent = "space-between"
    if(data.notes === ""){
        let textBox = document.createElement("textarea")
        textBox.style.flexBasis = "100%"
        textBox.style.marginBlock = "0.5rem"
        textBox.style.borderRadius = "5px"
        textBox.style.padding = "0.5rem"
        textBox.style.backgroundColor = "#eee"
        textBox.style.fontFamily = "system-ui"
        textBox.style.fontSize = "16px"
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
    notesDiv.style.backgroundColor = "#ccc"
    notesDiv.style.flexBasis = "100%"
    notesDiv.style.padding = "0.5rem"
    notesDiv.style.marginBlock = "0.5rem"
    notesDiv.style.borderRadius = "5px"
    notesDiv.innerHTML = data.notes
    let editButton = document.createElement("button")
    editButton.innerHTML = "Edit"
    editButton.onclick = () => {
        let filledTextBox = document.createElement("textarea")
        filledTextBox.style.flexBasis = "100%"
        filledTextBox.style.marginBlock = "0.5rem"
        filledTextBox.style.borderRadius = "5px"
        filledTextBox.style.padding = "0.5rem"
        filledTextBox.style.backgroundColor = "#eee"
        filledTextBox.style.fontFamily = "system-ui"
        filledTextBox.style.fontSize = "16px"
        filledTextBox.innerHTML = data.notes
        let submitEditButton = document.createElement("button")
        submitEditButton.innerHTML = "Add Note"
        submitEditButton.onclick = () => {
            console.log(filledTextBox.value)
            data.notes = filledTextBox.value
            updateNote(data)
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