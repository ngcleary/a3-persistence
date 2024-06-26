
// Set input boxes to empty - user does not have to delete previous entry
const resetTextBoxes = function () {
  document.querySelector("#youritem").value = "";
  document.querySelector("#itemPrice").value = "";
  document.querySelector("#numItems").value = "";
  document.querySelector("#suggestItem").value = "";
  document.querySelector("#suggestQty").value = "";
  document.querySelector("#newitem").value = "";
  document.querySelector("#enterId").value = "";
};
// Adds row to HTML table creates an event listener for each button created - can get index from click
const addToTable = function (entry) {
  const table = document.getElementById("table");
  const row = `<tr id="entryRow">
                <td>${entry.name}</td>
                <td>${entry.item}</td>
                <td>${entry.qty}</td>
                <td>${entry.cost}</td>
                <td><button class="remove">Remove</button></td>
              </tr>`;
  table.insertAdjacentHTML("beforeend", row);
  //eventlistener
  const removeButton = table.querySelector(".remove:last-child");
  removeButton.addEventListener("click", function (event) {
    event.preventDefault();
  });
  resetTextBoxes();
};
//clear and rebuild
const generateTable = function (array) {
  for (let i = 0; i <= array.length; i++) {
    if (document.getElementById("guestName") != undefined) {
      document.getElementById("guestName").remove();
    }
    if (document.getElementById("entryRow") != undefined) {
      document.getElementById("entryRow").remove();
    }
  }
  for (let j = 0; j < array.length; j++) {
    addToTable(array[j]);
  }
  makeGuestList(array);
};
//check if input box is empty
function isEmpty(str) {
  return !str || str.length === 0;
}
const makeTable = function (array) {
  for (let j = 0; j < array.length; j++) {
    const entry = array[j];
    console.log("type of entry: ", typeof array[j].Sitem);
    console.log("entry item: ", array[j].Sitem);
    const table = document.getElementById("tableSuggest");
    const row = `<tr id="suggestRow">
              <td>${entry.Sitem}</td>
              <td>${entry.Sqty}</td>
              <td><button class="bring">Bring</button></td>
            </tr>`;
    table.insertAdjacentHTML("beforeend", row);
    //eventlistener
    const bringButton = table.querySelector(".bring:last-child");
    bringButton.addEventListener("click", function (event) {
      event.preventDefault();
    });
  }
};
const clearSuggest = function (array) {
  if (!!document.getElementById("suggestRow")) {
    for (let i = 0; i < array.length - 1; i++) {
      document.getElementById("suggestRow").remove();
    }
  } else {
    return;
  }
};
//creates an object and sends object to server side serverside sends back an array or JSON
const submit = async function (event) {
  event.preventDefault();
  const itemInput = document.querySelector("#youritem");
  const priceInput = document.querySelector("#itemPrice");
  const qtyInput = document.querySelector("#numItems");
  //check all fields complete
  if (isEmpty(itemInput.value) || isEmpty(qtyInput.value)) {
    alert(
      "Please fill out all fields. If the price is unknown, you may leave it blank."
    );
    return;
  }
  const newEntry = createEntry(
    itemInput.value,
    priceInput.value,
    qtyInput.value
  );
  const response = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEntry),
  });
  const text = await response.json();
  if (typeof text === "string") {
    alert(text);
  } else {
    const appdata = text.appdata;
    const suggestdata = text.suggestdata;
    const justAdded = appdata[appdata.length - 1];
    for (let i = 0; i < suggestdata.length; i++) {
      if (
        suggestdata[i].Sitem == justAdded.item &&
        suggestdata[i].Sqty == justAdded.qty
      ) {
        bring(i);
        remove(appdata.length);
        console.log(
          "item removed from bring and added to appdata: ",
          suggestdata[i]
        );
      }
    }
    generateTable(appdata);
    resetTextBoxes();
  }
  const appdata = text.appdata;
  const suggestdata = text.suggestdata;
  const justAdded = appdata[appdata.length - 1];
  for (let i = 0; i < suggestdata.length; i++) {
    if (
      suggestdata[i].Sitem == justAdded.item &&
      suggestdata[i].Sqty == justAdded.qty
    ) {
      bring(i);
      remove(appdata.length);
      console.log(
        "item removed from bring and added to appdata: ",
        suggestdata[i]
      );
    }
  }
  generateTable(appdata);
  resetTextBoxes();
};
const createEntry = function (item, price, qty) {
  const entry = {
    item: item,
    price: price,
    qty: qty,
  };
  return entry;
};
const createSuggest = function (item, qty) {
  const suggest = {
    Sitem: item,
    Sqty: qty,
  };
  return suggest;
};
//Check the array and compare to the name just entered - if name already in the array, do not add to list
//If the name is not in the array, add to list -> use set for uniqeness
const makeGuestList = function (array) {
  const uniqueNamesSet = new Set();
  const list = document.getElementById("guestList");
  list.innerHTML = ""; // Clear the existing list if needed
  array.forEach((obj) => {
    if (!uniqueNamesSet.has(obj.name)) {
      // Check if the name already exists in the set
      uniqueNamesSet.add(obj.name); // Add the name to the set
      const li = document.createElement("li");
      li.innerHTML = obj.name; // Use the name property of the object
      li.classList.add("list-group-item");
      list.appendChild(li);
    }
  });
};
//send empty data to server
const refreshPage = async function () {
  const response = await fetch("/refresh", {
    method: "POST",
    body: "",
  });
  const text = await response.json();
  const appdata = text.appdata;
  const suggestdata = text.suggestdata;
  generateTable(appdata);
  console.log("suggest ", suggestdata);
  clearSuggest(suggestdata);
  makeTable(suggestdata);
  console.log("page refreshed.");
};
//send the index of the entry user wants to delete from array
const remove = async function (entryIndex) {
  const reqObj = { entryIndex: entryIndex };
  const response = await fetch("/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqObj),
  });
  const text = await response.json();
  if (typeof text === "string") {
    alert(text);
  } else {
    generateTable(text);
  }
};

const suggest = async function (event) {
  event.preventDefault();
  const itemSuggest = document.querySelector("#suggestItem");
  const qtySuggest = document.querySelector("#suggestQty");
  if (isEmpty(itemSuggest.value) || isEmpty(qtySuggest.value)) {
    alert(
      "Please fill out all fields. If the quantity is unknown, you may leave it blank."
    );
    return;
  }
  const newSuggest = createSuggest(itemSuggest.value, qtySuggest.value);
  const response = await fetch("/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSuggest),
  });
  const text = await response.json();
  if (typeof text === "string") {
    alert(text);
  } else {
    const justAdded = text[text.length - 1];
    clearSuggest(text);
    makeTable(text);
    resetTextBoxes();
  }
};
const bring = async function (suggestIndex) {
  const reqObj = { suggestIndex: suggestIndex };
  const response = await fetch("/bring", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqObj),
  });
  const text = await response.json();
  const appdata = text.appdata;
  const suggestdata = text.suggestdata;
  addToTable(appdata[appdata.length - 1]);
  for (let i = 0; i <= suggestdata.length; i++) {
    document.getElementById("suggestRow").remove();
  }
  clearSuggest(suggestdata);
  makeTable(suggestdata);
};

const logout = async function (event) {
  event.preventDefault();
  const response = await fetch("/logout", {
    method: "GET",
  }).then((response) => {
    window.location.href = "/";
  });
};

const edit = async function (event) {
  console.log("EDIT");
  event.preventDefault();
  let editelement;
  const tableId = document.querySelector("#enterId");
  const newitem = document.querySelector("#newitem");

  if (document.getElementById("item").checked) {
    editelement = "item";
  } else if (document.getElementById("qty").checked) {
    editelement = "qty";
  } else {
    editelement = "price";
  }
  if (isEmpty(tableId.value)) {
    alert(
      "Please enter the ID number of the item you wish to edit, and select an attribute to change. Please note you cannot edit other users items."
    );
    return;
  }
  const editObject = {
    ogItem: tableId.value,
    edit: editelement,
    newitem: newitem.value,
  };
  const response = await fetch("/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editObject),
  });
  
  const text = await response.json();
  console.log("edit: ", text);
  if (typeof text === "string") {
    alert(text);
  } else {
    generateTable(text);
    resetTextBoxes();
  }
  
};
let toggleCount = 1;

const togglefunction = function (event) {
  event.preventDefault();
  if (event.target && event.target.classList.contains("toggleguestlist")) {
    const isChecked = event.target.getAttribute("aria-checked") === "true";
    event.target.setAttribute("aria-checked", !isChecked);
    if (!event.target.isChecked) {
      toggleCount++;
    }
    if (toggleCount % 2 != 0) {
      console.log("count: ", toggleCount);
      document.getElementById("names").style.visibility = "visible";
    } else if (toggleCount % 2 == 0) {
      document.getElementById("names").style.visibility = "hidden";
    }
  }
};

const radiofunction = function (event) {
  event.preventDefault();
  if (event.target && event.target.classList.contains("radio")) {
    event.target.setAttribute("checked", "");
  }
};

window.onload = function () {
  refreshPage();
  const button = document.getElementById("submit");
  button.onclick = submit;
  const suggestButton = document.getElementById("suggest");
  suggestButton.onclick = suggest;
  const logoutButton = document.getElementById("logout");
  logoutButton.onclick = logout;
  const editButton = document.getElementById("edit");
  editButton.onclick = edit;

  const toggleElement = document.querySelector(".toggleguestlist");
  toggleElement.addEventListener("dblclick", togglefunction, false);

  const tableEvent = document.getElementById("table");
  tableEvent.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target && event.target.classList.contains("remove")) {
      const entryIndex = event.target.closest("tr").rowIndex - 1; // Subtract 1 because of table header
      remove.onclick = remove(entryIndex);
    }
  });

  const table2Event = document.getElementById("tableSuggest");
  table2Event.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target && event.target.classList.contains("bring")) {
      const suggestIndex = event.target.closest("tr").rowIndex - 1;
      bring.onclick = bring(suggestIndex);
    }
  });
};
