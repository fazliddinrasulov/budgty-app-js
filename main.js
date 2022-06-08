//BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    persentage: -1
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(current){
        sum += current.value;
    });
    data.totals[type] = sum;
  };
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //[1 2 3 4 5], next ID = 6
      //[1 2 4 6 8], next ID = 9
      // ID = last ID + 1

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item ba sed on "inc" or "exp" type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into  our data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;
      // id = 6
      // data.allItems[type][id];
      // ids = [1 2 4 6 7 9]
      // index = 3

      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);
      if(index !== -1 ){
        data.allItems[type].splice(index, 1)
      }
    },


    calculateBudget: function(){

      // Calculate total income  and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      
      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp
      
      // Calculate the persentage of income that we spent
      if(data.budget>0){
        data.persentage =Math.round((data.totals.exp/data.totals.inc)*100);
      }
      else{
        data.persentage = -1;   
      }
    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        persentage: data.persentage 
      };

    },

    testing: function () {
      console.log(data);
    },

    
  };
})();
//UICONTROLLER
var UIController = (function () {
  return {
    getInput: function () {
      return {
        type: document.querySelector(".add__type").value, // will be either 'inc' or 'exp'
        description: document.querySelector(".add__description").value,
        value: parseFloat(document.querySelector(".add__value").value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder tet
      if (type === "inc") {
        element = ".income__list";
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = ".expenses__list";
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    
    deleteListItems: function(selectorID){
      var el=document.getElementById(selectorID);
      el.parentNode.removeChild(el)
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        ".add__description" + "," + ".add__value"
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(i, index, arr){
        i.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
        document.querySelector(".budget__value").textContent = obj.budget;
        document.querySelector(".budget__income--value").textContent = obj.totalInc;
        document.querySelector(".budget__expenses--value").textContent = obj.totalExp;
        if(obj.persentage > 0){
          document.querySelector(".budget__expenses--percentage").textContent = obj.persentage + "%";
        }
        else{
          document.querySelector(".budget__expenses--percentage").textContent = "--";
        }
    },
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setEventListeners = function () {
    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  
  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();
    console.log(input);
    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
    // 2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. Add the item to the UI
    UICtrl.addListItem(newItem, input.type);

    // 4. Clear the fields
    UICtrl.clearFields();

    // 5. Calculate and Update budget
    updateBudget();
  }
  };

  var updateBudget = function(){
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget 
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  }
  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID){
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // 2. Delete the item from the UI
      UICtrl.deleteListItems(itemID)

      // 3. Update the show the new budget
      updateBudget();
    }
  }

  document.querySelector(".container").addEventListener("click", ctrlDeleteItem)

  return {
    init: function () {
      console.log("Application has started");
      document.querySelector(".budget__value").textContent = 0;
      document.querySelector(".budget__income--value").textContent = 0;
      document.querySelector(".budget__expenses--value").textContent = 0;
      document.querySelector(".budget__expenses--percentage").textContent = "--";
      setEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
