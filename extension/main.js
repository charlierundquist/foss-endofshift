let interval = setInterval(() => {
    let h1 = document.querySelector("h1");
    if(h1){
        initFunc()
        clearInterval(interval)
    }
}, 100);

function initFunc() {
    const url = document.URL;
    if(url.split("/")[url.split("/").length - 1] != "family-information"){
        console.log("not right");
        window.navigation.addEventListener("hashchange", (event) => {
            console.log(event.newURL);
        });
        return;
    }
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
        }, 500);
    };
    document.body.appendChild(iframe);
    setTimeout(() => {
        navigator.clipboard.writeText("FAMILYINFO___" + url + "___" + name + "___" + phone + "___" + childrenInfo);
    }, 1500);
}