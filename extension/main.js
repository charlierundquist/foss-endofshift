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
                let notebook = document.querySelector(".notebook iframe")
                notebook.contentWindow.postMessage("hello")
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
    navigator.clipboard.writeText(element.getAttribute("data-familyinfo"))
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
    iframe.setAttribute("src", "https://charlierundquist.github.io/foss-endofshift/static")

    let container = document.createElement("div")
    container.classList.add("notebook")
    container.style.width = "60ch"
    container.style.position = "fixed"
    container.style.top = "30vh"
    container.style.backgroundColor = "white"
    container.style.padding = "1rem"
    container.style.border = "1px solid black"
    container.style.borderRadius = "5px"
    container.style.display = "none"
    container.appendChild(iframe)
    document.body.appendChild(container)

    let button = document.createElement("button")
    button.style.cursor = "pointer"
    button.setAttribute("type", "button")
    button.className = "c-button c-button--icon notebook-button"
    button.onclick = () => {
        if(container.style.display === "block"){
            container.style.display = "none"
            return
        }
        container.style.display = "block"
    }
    let iconDiv = document.createElement("i")
    iconDiv.className = "icon"
    iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("print-solid-full.svg") + ")"
    iconDiv.style.height = "20px"
    iconDiv.style.width = "20px"
    button.appendChild(iconDiv)

    let buttonRow = document.querySelector("foss-alerts-icon")
    buttonRow.style.display = "flex"
    buttonRow.style.gap = "1rem"
    buttonRow.prepend(button)
}