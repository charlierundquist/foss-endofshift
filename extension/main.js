let interval = setInterval(() => {
    let h1 = document.querySelector("h1");
    if(h1){
        initFunc()
        clearInterval(interval)
    }
}, 100);

let infoLoaded = false;

function initFunc() {
    let url = '';
    const observer = new MutationObserver(function(mutations) {
        if (location.href !== url) {
            url = location.href;
            if(url.split("/")[url.split("/").length - 1] != "family-information"){
                return;
            }
            let keyframesTag = document.createElement("style")
            keyframesTag.textContent = "@keyframes spinning{to{transform: rotate(1turn)}}"
            document.head.appendChild(keyframesTag)

            let copyButton = document.createElement("button")
            copyButton.setAttribute("disabled", "true")
            copyButton.setAttribute("type", "button")
            copyButton.className = "c-button c-button--icon"
            copyButton.addEventListener("click", (e) => {
                copyInfoToClipboard(copyButton)
            })
            let iconDiv = document.createElement("i")
            iconDiv.className = "icon"
            iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("spinner-solid-full.svg") + ")"
            iconDiv.style.height = "20px"
            iconDiv.style.width = "20px"
            iconDiv.style.animation = "spinning 1.5s infinite linear"
            copyButton.appendChild(iconDiv)

            let buttonsRow = document.querySelector(".fi-buttons-row")
            buttonsRow.appendChild(copyButton)
            
            getFamilyInfo(url, copyButton);
            
            addNotebookButton();
            addFamSwimButton();
        }
    });
    const config = {subtree: true, childList: true};
    observer.observe(document, config);
    return;
}

function getFamilyInfo(url, copyButton){
    const familyNumber = url.split("details/")[1].split("/")[0];
    const name = document.querySelector(".u-details__name").getAttribute("title").split(",")[0];
    const phone = "(" + document.querySelector(".fi-info > div:nth-child(2) > div:nth-child(2)").innerHTML.split("(")[1];
    let childrenInfo = "";
    let gotChildren = false;
    let iframe = document.createElement("iframe");
    iframe.setAttribute("src", "/families/details/" + familyNumber + "/students");
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.display = "none";
    iframe.onload = () => {
        let getStudentDivsInterval = setInterval(() => {
            let studentDivs = iframe.contentWindow.document.querySelectorAll(".sw-student");
            if(studentDivs.length === 0) return

            childrenInfo += ":::";
            
            [...studentDivs].map((div, i) => {
                let name = div.querySelector(".u-details__name").getAttribute("title");

                childrenInfo += name

                let classDivs = div.querySelectorAll(".c-list-data__row");
                [...classDivs].map((row, i) => {

                    if(!row.querySelector(".sw-session-col").innerHTML.includes("Spring 2026")){
                        return
                    }
                    let statusColDiv = row.querySelector(".sw-status-col")
                    if (statusColDiv === null){
                        console.log("dropped")
                        return
                    }
                    const statusColContent = statusColDiv.querySelector("span").innerHTML
                    if(!statusColContent.includes("Enrolled") && !statusColContent.includes("Stay") && !statusColContent.includes("Advance") && !statusColContent.includes("Reassign")){
                        console.log("returning")
                        return
                    }

                    childrenInfo += "<CLASS>"

                    let classLevel = "/" + row.querySelector(".sw-level-col > span").innerHTML
                    let classDay = "/" + row.querySelector(".sw-day-col").innerHTML
                    let classTime = "/" + row.querySelector(".sw-time-col").innerHTML

                    childrenInfo += classLevel + classDay + classTime

                })

                childrenInfo += ":::"

            });

            childrenInfo += ":::"

            gotChildren = true
            clearInterval(getStudentDivsInterval)
            iframe.remove()
        }, 100);
    };
    document.body.appendChild(iframe);
    let setClipboardInterval = setInterval(() => {
        if(!gotChildren) return

        copyButton.setAttribute("data-familyinfo", "FAMILYINFO___" + url + "___" + name + "___" + phone + "___" + childrenInfo);
        copyButton.removeAttribute("disabled");
        let iconDiv = copyButton.querySelector("i");
        iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("plus-solid-full.svg") + ")";
        iconDiv.style.animation = "";

        infoLoaded = true
        clearInterval(setClipboardInterval)

    }, 100);
}

function copyInfoToClipboard(element) {
    let clipboardString = element.getAttribute("data-familyinfo")
    // navigator.clipboard.writeText(clipboardString)

    let notebook = document.querySelector(".notebook iframe")
    notebook.contentWindow.postMessage({action: "addNote", string: clipboardString}, "*")

    let notebookContainer = document.querySelector(".notebook")
    let notebookBackground = document.querySelector(".notebook-background")
    notebookContainer.style.display = "block"
    notebookBackground.style.display = "block"

    let iconDiv = element.querySelector("i")
    iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("check-solid-full.svg") + ")"
    setTimeout(() => {
        iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("plus-solid-full.svg") + ")"
    }, 2000);
}

function addNotebookButton() {
    if(document.querySelector(".notebook-button") != null) return

    let iframe = document.createElement("iframe")
    iframe.style.width = "100%"
    iframe.style.height = "100%"
    iframe.setAttribute("src", "https://charlierundquist.github.io/foss-endofshift/static")

    let container = document.createElement("div")
    container.classList.add("notebook")
    container.style.width = "870px"
    container.style.height = "75vh"
    container.style.position = "fixed"
    container.style.zIndex = "500"
    container.style.top = "50%"
    container.style.left = "50%"
    container.style.translate = "-50% -50%"
    container.style.backgroundColor = "white"
    container.style.padding = "3rem"
    container.style.display = "none"
    container.appendChild(iframe)
    document.body.appendChild(container)

    let background = document.createElement("div")
    background.classList.add("notebook-background")
    background.style.position = "fixed"
    background.style.display = "none"
    background.style.width = "100vw"
    background.style.height = "100vh"
    background.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    background.style.zIndex = "400"
    background.onclick = () => {
        container.style.display = "none"
        background.style.display = "none"
    }
    document.body.appendChild(background)

    let button = document.createElement("button")
    button.style.cursor = "pointer"
    button.setAttribute("type", "button")
    button.className = "c-button c-button--icon notebook-button"
    button.onclick = () => {
        if(container.style.display === "block"){
            container.style.display = "none"
            background.style.display = "none"
            return
        }
        iframe.contentWindow.postMessage({action: "getAllNotes"}, "*")
        container.style.display = "block"
        background.style.display = "block"
    }
    let iconDiv = document.createElement("i")
    iconDiv.className = "icon"
    iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("pen-to-square-regular-full.svg") + ")"
    iconDiv.style.height = "20px"
    iconDiv.style.width = "20px"
    button.appendChild(iconDiv)

    let buttonRow = document.querySelector("foss-alerts-icon")
    buttonRow.style.display = "flex"
    buttonRow.style.gap = "1rem"
    buttonRow.prepend(button)
}

function addFamSwimButton(){

    // get data
    const parentName = document.querySelector(".u-details__name").getAttribute("title")
    const phoneNumber = "(" + document.querySelector(".fi-info > div:nth-child(2) > div:nth-child(2)").innerHTML.split("(")[1];
    const emailAddress = document.querySelector(".fi-info > div:nth-child(3) > div:nth-child(2)").getAttribute("title");
    const cssInitials = document.querySelector(".header__admin-name").innerHTML.substring(0,2).toUpperCase();
    
    // add to dom
    let popupContainer = document.createElement("div")
    popupContainer.classList.add("famswimpopup")
    popupContainer.style.width = "870px"
    popupContainer.style.height = "75vh"
    popupContainer.style.position = "fixed"
    popupContainer.style.zIndex = "500"
    popupContainer.style.top = "50%"
    popupContainer.style.left = "50%"
    popupContainer.style.translate = "-50% -50%"
    popupContainer.style.backgroundColor = "white"
    popupContainer.style.padding = "3rem"
    popupContainer.style.display = "none"
    document.body.appendChild(popupContainer)

    let countersContainer = document.createElement("div")
    countersContainer.style.display = "flex"
    countersContainer.style.justifyContent = "space-around"
    countersContainer.style.width = "20rem"
    countersContainer.style.marginInline = "auto"

    let parentCounter = document.createElement("div")
    parentCounter.style.gridTemplateColumns = "3fr 1fr"
    parentCounter.style.gridTemplateRows = "1fr 1fr"
    parentCounter.style.display = "grid"
    parentCounter.style.width = "5rem"

    let pNumber = document.createElement("div")
    pNumber.innerHTML = "1"
    pNumber.style.gridArea = "1 / 1 / 3 / 2"
    pNumber.style.width = "fit-content"
    pNumber.style.height = "fit-content"
    pNumber.style.placeSelf = "center"
    pNumber.style.fontSize = "30px"
    parentCounter.appendChild(pNumber)

    let pUpButton = document.createElement("button")
    pUpButton.style.cursor = "pointer"
    pUpButton.setAttribute("type", "button")
    pUpButton.className = "c-button c-button--icon notebook-button"
    pUpButton.style.gridArea = "1 / 2 / 2 / 3"
    pUpButton.style.border = "none"
    pUpButton.style.background = "none"
    pUpButton.onclick = () => {
        let currentNumber = parseInt(pNumber.innerHTML)
        let newNumber = (currentNumber + 1) % 6
        if(newNumber === 0) newNumber = 1
        pNumber.innerHTML = newNumber
    }
    let pUpIcon = document.createElement("i")
    pUpIcon.className = "icon"
    pUpIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("caret-up-solid-full.svg") + ")"
    pUpIcon.style.height = "20px"
    pUpIcon.style.width = "20px"
    pUpButton.appendChild(pUpIcon)
    parentCounter.appendChild(pUpButton)

    let pDownButton = document.createElement("button")
    pDownButton.style.cursor = "pointer"
    pDownButton.setAttribute("type", "button")
    pDownButton.className = "c-button c-button--icon notebook-button"
    pDownButton.style.gridArea = "2 / 2 / 3 / 3"
    pDownButton.style.border = "none"
    pDownButton.style.background = "none"
    pDownButton.onclick = () => {
        let currentNumber = parseInt(pNumber.innerHTML)
        let newNumber = (currentNumber - 1) % 6
        if(newNumber === 0) newNumber = 5
        pNumber.innerHTML = newNumber
    }
    let pDownIcon = document.createElement("i")
    pDownIcon.className = "icon"
    pDownIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("caret-down-solid-full.svg") + ")"
    pDownIcon.style.height = "20px"
    pDownIcon.style.width = "20px"
    pUpButton.appendChild(pDownIcon)
    parentCounter.appendChild(pDownButton)

    let childCounter = document.createElement("div")
    childCounter.style.gridTemplateColumns = "3fr 1fr"
    childCounter.style.gridTemplateRows = "1fr 1fr"
    childCounter.style.display = "grid"
    childCounter.style.width = "5rem"

    let cNumber = document.createElement("div")
    cNumber.innerHTML = "1"
    cNumber.style.gridArea = "1 / 1 / 3 / 2"
    cNumber.style.width = "fit-content"
    cNumber.style.height = "fit-content"
    cNumber.style.placeSelf = "center"
    cNumber.style.fontSize = "30px"
    childCounter.appendChild(cNumber)

    let cUpButton = document.createElement("button")
    cUpButton.innerHTML = "/\\"
    cUpButton.style.gridArea = "1 / 2 / 2 / 3"
    cUpButton.style.border = "none"
    cUpButton.style.background = "none"
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
    cDownButton.style.border = "none"
    cDownButton.style.background = "none"
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

    countersContainer.appendChild(parentCounter)
    countersContainer.appendChild(childCounter)
    
    popupContainer.appendChild(countersContainer)
    popupContainer.appendChild(submitButton)

    let background = document.createElement("div")
    background.classList.add("famswim-background")
    background.style.position = "fixed"
    background.style.display = "none"
    background.style.width = "100vw"
    background.style.height = "100vh"
    background.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    background.style.zIndex = "400"
    background.onclick = () => {
        popupContainer.style.display = "none"
        background.style.display = "none"
    }
    document.body.appendChild(background)

    let buttonRow = document.querySelector(".fi-parent .fi-buttons-row")
    let addToFamSwimButton = document.createElement("button")
    addToFamSwimButton.className = "c-button c-button--icon"
    addToFamSwimButton.setAttribute("parentName", parentName)
    addToFamSwimButton.setAttribute("phoneNumber", phoneNumber)
    addToFamSwimButton.setAttribute("emailAddress", emailAddress)
    addToFamSwimButton.setAttribute("cssInitials", cssInitials)
    addToFamSwimButton.onclick = () => {
        popupContainer.style.display = "block"
        background.style.display = "block"
    }
    buttonRow.appendChild(addToFamSwimButton)

}