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
            if(url.split("/")[url.split("/").length - 1] === "login"){
                    return;
                }

            addNotebookButton();

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
            checkPreferredLocation();
            addFamSwimButton();
            makeAccountNumberCopiable();
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

                    if(!row.querySelector(".sw-session-col").innerHTML.includes("Summer 2026")){
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
    const nameSplit = document.querySelector(".u-details__name").getAttribute("title").split(", ")
    const parentName = {
        first: nameSplit[1],
        last: nameSplit[0]
    }
    const phoneNumber = "(" + document.querySelector(".fi-info > div:nth-child(2) > div:nth-child(2)").innerHTML.split("(")[1];
    const emailAddress = document.querySelector(".fi-info > div:nth-child(3) > div:nth-child(2)").getAttribute("title");
    const cssInitials = document.querySelector(".header__admin-name").innerHTML.substring(0,2).toUpperCase();
    const todaysDate = (new Date().getMonth() + 1) +  "/" + new Date().getDate()
    
    // add to dom
    let popupContainer = document.createElement("div")
    popupContainer.classList.add("famswimpopup")
    popupContainer.style.width = "60ch"
    popupContainer.style.position = "fixed"
    popupContainer.style.zIndex = "500"
    popupContainer.style.top = "50%"
    popupContainer.style.left = "50%"
    popupContainer.style.translate = "-50% -50%"
    popupContainer.style.backgroundColor = "white"
    popupContainer.style.padding = "3rem"
    popupContainer.style.display = "none"
    document.body.appendChild(popupContainer)

    let titleDiv = document.createElement("h2")
    titleDiv.innerHTML = "FAMILY SWIM ATTENDANCE"
    titleDiv.style.fontSize = "2rem"
    titleDiv.style.textAlign = "center"
    titleDiv.style.marginBottom = "4rem"
    popupContainer.appendChild(titleDiv)

    let countersContainer = document.createElement("div")
    countersContainer.style.display = "flex"
    countersContainer.style.justifyContent = "space-around"
    countersContainer.style.alignItems = "center"
    countersContainer.style.width = "40rem"
    countersContainer.style.marginBlock = "auto"
    countersContainer.style.marginInline = "auto"

    let parentCounter = makeNewCounter("Adults:")
    let childCounter = makeNewCounter("Children:")

    let submitButton = document.createElement("button")
    submitButton.setAttribute("type", "button")
    submitButton.className = "c-button c-button--icon"
    submitButton.style.alignSelf = "end"
    let submitButtonIcon = document.createElement("i")
    submitButtonIcon.className = "icon"
    submitButtonIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("up-right-from-square-solid-full.svg") + ")"
    submitButtonIcon.style.height = "20px"
    submitButtonIcon.style.width = "20px"
    submitButton.appendChild(submitButtonIcon)
    submitButton.onclick = () => {
        let parentCount = parseInt(parentCounter.getAttribute("number"))
        let childCount = parseInt(childCounter.getAttribute("number"))

       navigator.clipboard.writeText(parentName.last + "\t" + parentName.first + "\t" + emailAddress + "\t" + phoneNumber + "\t" + parentCount + "\t" + childCount + "\t" + todaysDate + " " + cssInitials)

       submitButtonIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("check-solid-full.svg") + ")"
       setTimeout(() => {
            submitButtonIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("up-right-from-square-solid-full.svg") + ")"
       }, 1000)
    }

    countersContainer.appendChild(parentCounter)
    countersContainer.appendChild(childCounter)
    countersContainer.appendChild(submitButton)
    
    popupContainer.appendChild(countersContainer)

    let instructionsContainer = document.createElement("div")
    let image = document.createElement("img")
    image.src = chrome.runtime.getURL("famswim-paste-instructions.jpg")
    image.style.maxWidth = "100%"
    image.style.border = "2px solid #777"
    image.style.marginTop = "4rem"
    instructionsContainer.appendChild(image)

    let details = document.createElement("p")
    details.innerHTML = "Adjust the amount of adults and children that will be attending the family swim, then hit the export button to the right. Then, in the family swim spreadsheet, select the column highlighted in the spreadsheet at the lowest available row, then paste(ctrl+v). Double check to make sure that the maximum attendance has not been exceeded!"
    details.style.fontStyle = "italic"
    details.style.lineHeight = "1.5"
    details.style.marginTop = "4rem"
    details.style.textAlign = "center"
    instructionsContainer.appendChild(details)

    popupContainer.appendChild(instructionsContainer)

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
    let fsButton = document.createElement("button")
    fsButton.innerHTML = "Sign up for Family Swim"
    fsButton.style.border = "none"
    fsButton.style.background = "none"
    fsButton.style.textDecoration = "underline"
    fsButton.style.cursor = "pointer"
    fsButton.style.color = "#222"
    fsButton.setAttribute("parentName", parentName)
    fsButton.setAttribute("phoneNumber", phoneNumber)
    fsButton.setAttribute("emailAddress", emailAddress)
    fsButton.setAttribute("cssInitials", cssInitials)
    fsButton.onclick = () => {
        popupContainer.style.display = "block"
        background.style.display = "block"
    }
    buttonRow.appendChild(fsButton)

}

function makeNewCounter(label){
    let container = document.createElement("div")
    container.style.display = "grid"
    container.style.gridTemplateRows = "1fr 1fr"
    container.setAttribute("number", "1")

    let labelDiv = document.createElement("p")
    labelDiv.innerHTML = label
    labelDiv.style.textAlign = "center"
    labelDiv.style.fontSize = "16px"
    container.appendChild(labelDiv)

    let counter = document.createElement("div")
    counter.style.display = "flex"
    counter.style.gap = "2rem"

    let number = document.createElement("div")
    number.innerHTML = "1"
    number.style.width = "fit-content"
    number.style.height = "fit-content"
    number.style.placeSelf = "center"
    number.style.fontSize = "30px"

    let upButton = document.createElement("button")
    upButton.setAttribute("type", "button")
    upButton.className = "c-button c-button--icon"
    let upIcon = document.createElement("i")
    upIcon.className = "icon"
    upIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("plus-solid-full.svg") + ")"
    upIcon.style.height = "20px"
    upIcon.style.width = "20px"
    upButton.appendChild(upIcon)
    upButton.onclick = () => {
        let currentNumber = parseInt(number.innerHTML)
        let newNumber = (currentNumber + 1) % 6
        if(newNumber === 0) newNumber = 1
        number.innerHTML = newNumber
        container.setAttribute("number", newNumber)
    }

    let downButton = document.createElement("button")
    downButton.setAttribute("type", "button")
    downButton.className = "c-button c-button--icon"
    let downIcon = document.createElement("i")
    downIcon.className = "icon"
    downIcon.style.backgroundImage = "url(" + chrome.runtime.getURL("minus-solid-full.svg") + ")"
    downIcon.style.height = "20px"
    downIcon.style.width = "20px"
    downButton.appendChild(downIcon)
    downButton.onclick = () => {
        let currentNumber = parseInt(number.innerHTML)
        let newNumber = (currentNumber - 1) % 6
        if(newNumber === 0) newNumber = 5
        number.innerHTML = newNumber
        container.setAttribute("number", newNumber)
    }

    counter.appendChild(downButton)
    counter.appendChild(number)
    counter.appendChild(upButton)
    container.appendChild(counter)

    return container
}

function checkPreferredLocation(){
    let locationDiv = document.querySelector(".fi-general-information > div:nth-child(2) > .ng-binding")
    if(locationDiv.innerHTML === "Apple Valley"){
        return
    }
    locationDiv.style.color = "red"
    locationDiv.innerHTML += " - Change this when enrolling!"
}

function makeAccountNumberCopiable(){
    let h1 = document.querySelector("h1")
    let number = document.querySelector("h1 > span")
    number.style.cursor = "pointer"
    number.style.position = "relative"
    number.onclick = () => {
        let oldText = number.innerHTML.split("#")[1]
        navigator.clipboard.writeText(oldText)
        number.innerHTML = "copied!"
        number.style.fontStyle = "italic"
        setTimeout(() => {
            number.innerHTML = "#" + oldText
            number.style.fontStyle = "unset"
        }, 1000);
        number.appendChild(confirmation)
    }
}