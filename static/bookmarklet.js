javascript:
(()=>{
const url = document.URL;
const name = document.querySelector(".u-details__name").getAttribute("title").split(",")[0];
const phone = "(" + document.querySelector(".fi-info > div:nth-child(2) > div:nth-child(2)").innerHTML.split("(")[1];
navigator.clipboard.writeText("FAMILYINFO___" + url + "___" + name + "___" + phone);
let iframe = document.createElement("iframe");
iframe.setAttribute("src", "/families/details/430199/students");
iframe.style.width = "0px";
iframe.style.height = "0px";
iframe.style.display = "none";
iframe.onload = () => {
    setTimeout(() => {
        let studentDivs = iframe.contentWindow.document.querySelectorAll(".sw-student .u-details__name");

        [...studentDivs].map((div, i) => {
            console.log(div.getAttribute("title"));
        });
    }, 500);
};
document.body.appendChild(iframe);
})();