// CUSTOM ALERT FUNCTIONS

function showAlert(message){

const overlay = document.getElementById("customAlert");
const msg = document.getElementById("alertMessage");

msg.innerText = message;
overlay.style.display = "flex";
  
}
 
function closeAlert(){
document.getElementById("customAlert").style.display = "none";

}


// LOST ITEM SUBMIT
const lostForm = document.getElementById("lostForm");

if(lostForm){
lostForm.addEventListener("submit", async function(e){

e.preventDefault();

const formData = new FormData(this);
const response = await fetch("http://localhost:5000/lost-item",{
method:"POST",
body:formData
});

const result = await response.text();
showAlert(result);
this.reset();
});
}


// FOUND ITEM SUBMIT
const foundForm = document.getElementById("foundForm");

if(foundForm){
foundForm.addEventListener("submit", async function(e){

e.preventDefault();

const formData = new FormData(this);
const response = await fetch("http://localhost:5000/found-item",{
method:"POST",
body:formData
});

const result = await response.text();
showAlert(result);
this.reset();

});
}


// REGISTER
// REGISTER
const registerForm = document.getElementById("registerForm");

if(registerForm){
registerForm.addEventListener("submit", function(e){

e.preventDefault();

const phone = document.getElementById("phone").value.trim();

// check if phone has exactly 10 digits
const phonePattern = /^[0-9]{10}$/;

if(!phonePattern.test(phone)){
showAlert("Phone number must be exactly 10 digits!");
return;
}

showAlert("Registration successful!");
this.reset();

});
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if(loginForm){
loginForm.addEventListener("submit", function(e){

e.preventDefault();

showAlert("Login Successful!");
this.reset(); 
});
}

// LOAD ITEMS ON HOMEPAGE in Recent item Card so that user can view the details of products which is recently added : 

// LOAD ITEMS ON HOMEPAGE

const container = document.getElementById("itemsContainer");
const emptyMessage = document.getElementById("emptyMessage");

if(container){

async function loadItems(){

container.innerHTML = "";
// container.appendChild(emptyMessage);

const lostRes = await fetch("http://localhost:5000/lost-items");
const lostItems = await lostRes.json();
const foundRes = await fetch("http://localhost:5000/found-items");
const foundItems = await foundRes.json();


let allItems = [
...lostItems.map(item => ({...item, type:"Lost"})),
...foundItems.map(item => ({...item, type:"Found"}))
];

// latest first
allItems.reverse();

// DO NOT slice here ❌

// store full list
window.allItems = allItems;

// show only 3 on homepage
displayItems(allItems.slice(0,3));

// allItems.forEach(item => {
// const card = document.createElement("div");
// card.classList.add("item-card");
// card.innerHTML = `
// <img src="http://localhost:5000/uploads/${item.image}" alt="Item Image">
// <h3>${item.itemname}</h3>
// <p><strong>Status:</strong> ${item.type}</p>
// <p>Category: ${item.category}</p>
// <p>Location: ${item.location}</p>
// <button class="view-btn" onclick="viewDetails(${item.id}, '${item.type}')">
// View Details
// </button>
// `;
// container.appendChild(card);
// });
// window.allItems = allItems; // store globally
// displayItems(allItems);
}
loadItems();

}
function viewDetails(id,type){
window.location.href = `itemdetail.html?id=${id}&type=${type}`;
}

function displayItems(items){
container.innerHTML = "";
if(items.length === 0){
emptyMessage.style.display = "block";
return;
}

emptyMessage.style.display = "none";
items.forEach(item => {
const card = document.createElement("div");
card.classList.add("item-card");
card.innerHTML = `
<img src="http://localhost:5000/uploads/${item.image}" alt="Item Image">
<h3>${item.itemname}</h3>
<p><strong>Status:</strong> ${item.type}</p>
<p>Category: ${item.category}</p>
<p>Location: ${item.location}</p>
<button class="view-btn" onclick="viewDetails(${item.id}, '${item.type}')">
View Details
</button>
`;
container.appendChild(card);
});
}

// ITEM DETAILS PAGE LOAD

const params = new URLSearchParams(window.location.search);

const itemId = params.get("id");
const itemType = params.get("type");

if(itemId && itemType){
loadItemDetails();
}

async function loadItemDetails(){

let url="";

if(itemType==="Lost"){
url=`http://localhost:5000/lost-items/${itemId}`;
}else{
url=`http://localhost:5000/found-items/${itemId}`;
}

const res = await fetch(url);
const item = await res.json();

// CONTACT OWNER BUTTON
const contactBtn = document.querySelector(".contact-btn");

if(contactBtn){
contactBtn.onclick = function(){
    showAlert(`Contact Details:\nPhone: ${item.phone}\nEmail: ${item.email}`);
};
}


// MARK AS RESOLVED BUTTON
const resolveBtn = document.querySelector(".resolve-btn");
if(resolveBtn){
resolveBtn.onclick = async function(){
const res = await fetch(`http://localhost:5000/mark-resolved/${itemId}`,{
    method: "PUT"
});
const msg = await res.text();
showAlert(msg);

// update status on UI
document.getElementById("disp-status").innerText = "Resolved";

};
}

// Fill data into page

document.getElementById("disp-item-name").innerText = item.itemname;
document.getElementById("disp-category").innerText = item.category;
document.getElementById("disp-description").innerText = item.description;
document.getElementById("disp-location").innerText = item.location;
document.getElementById("disp-date").innerText = item.date;
document.getElementById("disp-status").innerText = item.status;
document.getElementById("disp-type").innerText = itemType;
document.getElementById("disp-username").innerText = item.username;


// IMAGE

const img = document.getElementById("item-image");
const noImgText = document.getElementById("noImageText");

if(img){

if(item.image){
    img.src = `http://localhost:5000/uploads/${item.image}`;
    img.style.display = "block";
    noImgText.style.display = "none";
}else{
    img.style.display = "none";
    noImgText.style.display = "block";
}

}
}
const searchInput = document.getElementById("searchInput");

if(searchInput){
searchInput.addEventListener("input", function(){

const value = this.value.toLowerCase();

const filtered = window.allItems.filter(item =>
item.itemname.toLowerCase().includes(value) ||
item.category.toLowerCase().includes(value) ||
item.location.toLowerCase().includes(value)
);

displayItems(filtered);

});
}