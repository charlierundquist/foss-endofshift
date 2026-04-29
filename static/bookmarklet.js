javascript:
(()=>{
const url = document.URL;
const name = document.querySelector(".u-details__name").getAttribute("title").split(",")[0];
const phone = "(" + document.querySelector(".fi-info > div:nth-child(2) > div:nth-child(2)").innerHTML.split("(")[1];
navigator.clipboard.writeText("FAMILYINFO___" + url + "___" + name + "___" + phone);
let iframe = document.createElement("iframe");
iframe.setAttribute("src", "/families/details/430199/students");
iframe.style.width = "500px";
iframe.style.height = "500px";
iframe.contentDocument.addEventListener("DOMContentLoaded", () => {
    console.log(document.querySelector(".u-details__name"));
    console.log("hello world");
});
document.body.appendChild(iframe);
})();