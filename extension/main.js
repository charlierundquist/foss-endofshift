let interval = setInterval(() => {
    let h1 = document.querySelector("h1");
    if(h1){
        initFunc()
        clearInterval(interval)
    }
}, 100);

function initFunc() {
    let copyButton = document.createElement("button")
    copyButton.setAttribute("type", "button")
    copyButton.className = "c-button c-button--icon"
    copyButton.addEventListener("click", (e) => {
        copyInfoToClipboard(copyButton)
    })
    let iconDiv = document.createElement("i")
    iconDiv.className = "icon"
    iconDiv.style.backgroundImage = "url(" + chrome.runtime.getURL("plus-solid-full.svg") + ")"
    iconDiv.style.height = "20px"
    iconDiv.style.width = "20px"
    copyButton.appendChild(iconDiv)

    let buttonsRow = document.querySelector(".fi-buttons-row")
    buttonsRow.appendChild(copyButton)

    let url = '';
    const observer = new MutationObserver(function(mutations) {
        if (location.href !== url) {
            url = location.href;
            if(url.split("/")[url.split("/").length - 1] != "family-information"){
                return;
            }
            getFamilyInfo(url, copyButton);
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
    let iframe = document.createElement("iframe");
    iframe.setAttribute("src", "/families/details/" + familyNumber + "/students");
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.display = "none";
    iframe.onload = () => {
        setTimeout(() => {
            let studentDivs = iframe.contentWindow.document.querySelectorAll(".sw-student .u-details__name");

            childrenInfo += ":::";
            
            [...studentDivs].map((div, i) => {
                childrenInfo += div.getAttribute("title");
                childrenInfo += ":::";
            });

            iframe.remove()
        }, 500);
    };
    document.body.appendChild(iframe);
    setTimeout(() => {
        copyButton.setAttribute("data-familyinfo", "FAMILYINFO___" + url + "___" + name + "___" + phone + "___" + childrenInfo);
    }, 1500);
}

function copyInfoToClipboard(element) {
    navigator.clipboard.writeText(element.getAttribute("data-familyinfo"))
    alert("added!")
}