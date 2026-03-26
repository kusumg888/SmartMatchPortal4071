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
registerForm.addEventListener("submit", async function(e){

e.preventDefault();

const name = document.querySelector('[name="name"]').value.trim();
const email = document.querySelector('[name="email"]').value.trim();
const phone = document.getElementById("phone").value.trim();
const password = document.querySelector('[name="password"]').value.trim();

// ✅ Step 1: Empty check
if(!name || !email || !phone || !password){
    showAlert("Please fill all fields!");
    return;
}

// ✅ Step 2: Phone validation
const phonePattern = /^[0-9]{10}$/;


if(!phonePattern.test(phone)){
    showAlert("Phone number must be exactly 10 digits!");
    return;
}

try {
    // ✅ Step 3: SEND DATA TO BACKEND
    const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            phone,
            password
        })
    });

    const result = await response.text();

    showAlert(result);
    this.reset();

} catch (error) {
    console.error(error);
    showAlert("Server error!");
}

});
}


// LOGIN
// ✅ Add this at the TOP or BOTTOM

// function showAlert(message) {
//     const alertBox = document.getElementById("customAlert");
//     const alertMsg = document.getElementById("alertMessage");

//     alertMsg.innerText = message;
//     alertBox.style.display = "flex";
// }

function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}


// ================= LOGIN CODE =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const email = document.querySelector('[name="email"]').value.trim();
        const password = document.querySelector('[name="password"]').value.trim();

        if (!email || !password) {
            showAlert("Please fill all fields!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.text();
            console.log("Server response:", result);  // ✅ for debugging
            showAlert(result);
            if (result.includes("Login successful")) {
    this.reset();
}

        } catch (error) {
            console.error(error);
            showAlert("Server error!");
        }

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

try {
    let url = "";

    if (itemType === "Lost") {
        url = `http://localhost:5000/lost-items/${itemId}`;
    } else {
        url = `http://localhost:5000/found-items/${itemId}`;
    }

    const res = await fetch(url);

    if (!res.ok) {
        showAlert("Error loading item!");
        return;
    }

    const text = await res.text();
    console.log("Server Response:", text);

    let item;
    try {
        item = JSON.parse(text);
    } catch (err) {
        showAlert("Invalid server response!");
        return;
    }

    if (!item) {
        showAlert("Item not found!");
        return;
    }

//     // ✅ NOW YOUR EXISTING CODE CONTINUES
//     document.getElementById("disp-item-name").innerText = item.itemname;

// } catch (error) {
//     console.error(error);
//     showAlert("Error loading item details!");
// }

// }

// ✅ Fill data into page
        document.getElementById("disp-item-name").innerText = item.itemname || "-";
        document.getElementById("disp-category").innerText = item.category || "-";
        document.getElementById("disp-description").innerText = item.description || "-";
        document.getElementById("disp-location").innerText = item.location || "-";
        document.getElementById("disp-date").innerText = item.lostdate || item.founddate || "-";
        document.getElementById("disp-status").innerText = item.status || "Active";
        document.getElementById("disp-type").innerText = itemType;
        document.getElementById("disp-username").innerText = item.full_name || "Unknown";

        // ✅ IMAGE FIX
        const img = document.getElementById("item-image");
        const noImgText = document.getElementById("noImageText");

        if (item.image) {
            img.src = `http://localhost:5000/uploads/${item.image}`;
            img.style.display = "block";
            noImgText.style.display = "none";
        } else {
            img.style.display = "none";
            noImgText.style.display = "block";
        }

        // ✅ CONTACT BUTTON
        const contactBtn = document.querySelector(".contact-btn");
        if (contactBtn) {
            contactBtn.onclick = function () {
                showAlert(`Phone: ${item.phone || "N/A"}\nEmail: ${item.email || "N/A"}`);
            };
        }

        // ✅ MARK RESOLVED BUTTON
        const resolveBtn = document.querySelector(".resolve-btn");
        if (resolveBtn) {
            resolveBtn.onclick = async function () {
                const res = await fetch(`http://localhost:5000/mark-resolved/${itemId}`, {
                    method: "PUT"
                });

                const msg = await res.text();
                showAlert(msg);

                document.getElementById("disp-status").innerText = "Resolved";
            };
        }

    } catch (error) {
        console.error(error);
        showAlert("Error loading item details!");
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