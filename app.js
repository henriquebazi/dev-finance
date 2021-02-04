const modalOverlay = document.querySelector(".modal-overlay");
const transactionsContainer = document.querySelector("#data-table tbody");
const expenseDisplay = document.querySelector("#expense-display");
const incomeDisplay = document.querySelector("#income-display");
const totalDisplay = document.querySelector("#total-display");
const form = document.querySelector("form");
const switchButton = document.querySelector('[data-js="switch-button"]');
const html = document.querySelector("html");
const body = document.querySelector("body");
const header = document.querySelector("header");
const card = document.querySelector('.card')
const footer = document.querySelector("footer")
const table = document.querySelector('#data-table')
const help = document.querySelector('.help')

const modal = {
  toggle() {
    modalOverlay.classList.toggle("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const transaction = {
  all: Storage.get(),

  add(transac) {
    transaction.all.push(transac);

    App.reload();
  },

  remove(index) {
    transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let income = 0;

    transaction.all.forEach(({ amount }) => {
      if (amount > 0) {
        income += amount;
      }
    });

    return income;
  },

  expenses() {
    let expense = 0;

    transaction.all.forEach(({ amount }) => {
      if (amount < 0) {
        expense += amount;
      }
    });

    return expense;
  },

  total() {
    return transaction.incomes() + transaction.expenses();
  },
};

const dom = {
  transactionsContainer: transactionsContainer,

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = dom.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index

    dom.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const amount = utils.formatCurrency(transaction.amount);

    const html = ` 
      <td class="description">${transaction.description}</td>
      <td class=${cssClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td class="delete">
        <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
      </td>
    `;

    return html;
  },

  updateBalance() {
    incomeDisplay.innerHTML = utils.formatCurrency(transaction.incomes());
    expenseDisplay.innerHTML = utils.formatCurrency(transaction.expenses());
    totalDisplay.innerHTML = utils.formatCurrency(transaction.total());
  },

  clearTransactions() {
    dom.transactionsContainer.innerHTML = "";
  },
};

const utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },
  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
};

const App = {
  init() {
    transaction.all.forEach(dom.addTransaction);

    dom.updateBalance();

    Storage.set(transaction.all)
  },

  reload() {
    dom.clearTransactions();
    App.init();
  },
};

App.init();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = event.target.description.value
  const amount = event.target.amount.value
  const date = event.target.date.value

  try {
    if(description.trim() === "" && amount.trim() === "" && date.trim() === ""){
      throw new Error("Por favor, preencha todos os dados")
    } 
    else {
      transaction.add({
        description,
        amount: utils.formatAmount(amount),
        date: utils.formatDate(date)
      })

      event.target.reset()
      modal.toggle()
    }
    
  } catch (error) {
    alert(error.message)
  }
});

// DarkMode ---
const getStyle = (element, style) =>
  window.getComputedStyle(element).getPropertyValue(style);
  
const initialColors = {
  bg: getStyle(body, "--bg"),
  bgHeader: getStyle(header, "--bg-header"),
  colorLink: getStyle(body, "--color-link"),
  darkBlue: getStyle(footer, "--dark-blue"),
  bgCard: getStyle(card, "--bg-card"),
  colorTable: getStyle(table, "--color-table"),
  colorHelp: getStyle(help, "--color-help")
};

const darkMode = {
  bg: "#1d1d1d",
  bgHeader: "#4c0668",
  colorLink: "#f0f2f5",
  darkBlue: "#f0f2f5",
  bgCard: "#333333",
  colorTable: "#FFFFFF",
  colorHelp: "#FFFFFF"
};

const transformKey = (key) =>
  "--" + key.replace(/([A-Z])/, "-$1").toLowerCase();

const changeColors = (colors) => {
  Object.keys(colors).map((key) => {
    body.style.setProperty(transformKey(key), colors[key]);
    header.style.setProperty(transformKey(key), colors[key]);
  });
};

const nightModeStorage = localStorage.getItem('nightMode')

if (nightModeStorage) {
  switchButton.checked = true

  changeColors(darkMode) 
  localStorage.setItem('nightMode', true)
}

switchButton.addEventListener("change", ({ target }) => {
  if(target.checked) {
    changeColors(darkMode) 
    localStorage.setItem('nightMode', true)
    return
  }
  
  changeColors(initialColors);
  localStorage.removeItem('nightMode')
});
// Finish DarkMode ---