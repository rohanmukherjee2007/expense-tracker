const expenseForm = document.querySelector("#expense-form");
const tableBody = document.querySelector("#expense-table-body");
let editingExpenseId = null;

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = expenseForm.elements.name.value;
    const category = expenseForm.elements.category.value;
    const amount = expenseForm.elements.amount.value;
    const date = expenseForm.elements.date.value;
    if (editingExpenseId) {
        axios.put(`/expenses/${editingExpenseId}`, { name, category, amount, date })
            .then((response) => {
                const updatedExpense = response.data;
                const row = document.querySelector(`tr[data-id="${updatedExpense.id}"]`);
                row.querySelector(".expense-name").textContent = updatedExpense.name;
                row.querySelector(".expense-category").textContent = updatedExpense.category;
                row.querySelector(".expense-amount").textContent = updatedExpense.amount;
                row.querySelector(".expense-date").textContent = updatedExpense.date;
                editingExpenseId = null;
                expenseForm.reset();
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        axios.post("/expenses", { name, category, amount, date })
            .then((response) => {
                const newExpense = response.data;
                const newRow = document.createElement("tr");
                newRow.setAttribute("data-id", newExpense.id);
                newRow.innerHTML = `
                    <td class="expense-name">${newExpense.name}</td>
                    <td class="expense-category">${newExpense.category}</td>
                    <td class="expense-amount">${newExpense.amount}</td>
                    <td class="expense-date">${newExpense.date}</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>`
                ;
                tableBody.appendChild(newRow);
                expenseForm.reset();
            })
            .catch((error) => {
                console.error("Failed to add expense:", error);
            });
    }
});

tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const row = event.target.closest("tr");
        const expenseID = row.dataset.id;
        axios.delete(`/expenses/${expenseID}`)
            .then(() => {
                row.remove();
            })
            .catch((error) => {
                console.error("Failed to delete expense:", error);
            });
    } else if (event.target.classList.contains("edit-btn")) {
        const row = event.target.closest("tr");
        expenseForm.elements.name.value = row.querySelector(".expense-name").textContent;
        expenseForm.elements.category.value = row.querySelector(".expense-category").textContent;
        expenseForm.elements.amount.value = row.querySelector(".expense-amount").textContent;
        expenseForm.elements.date.value = row.querySelector(".expense-date").textContent;
        editingExpenseId = row.dataset.id;
    }
});


const categoryForm = document.querySelector("#add-category-form");
const categoryList = document.querySelector("#category-list");
const categorySelect = expenseForm.elements.category;

categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const category = categoryForm.elements.category.value;
    const amount = categoryForm.elements.amount.value;
    axios.post("/categories", { category, amount })
        .then((response) => {
            const newCategory = response.data;
            const newListItem = document.createElement("li");
            newListItem.setAttribute("data-category", newCategory.category);
            newListItem.innerHTML = `
                <span class="category-name">${newCategory.category}</span>:
                <span class="category-budget">${newCategory.amount}</span>
                <button class="delete-category-btn">Delete</button>`
            ;
            categoryList.appendChild(newListItem);
            const newOption = document.createElement("option");
            newOption.value = newCategory.category;
            newOption.textContent = newCategory.category;
            categorySelect.appendChild(newOption);
            categoryForm.reset();
        })
        .catch((error) => {
            console.error(error);
        });
});
categoryList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-category-btn")) {
        const listItem = event.target.closest("li");
        const categoryName = listItem.dataset.category;
        axios.delete(`/categories/${encodeURIComponent(categoryName)}`)
            .then(() => {
                listItem.remove();
                const optionToRemove = categorySelect.querySelector(`option[value="${categoryName}"]`);
                optionToRemove.remove();
            })
            .catch((error) => {
                console.error(error);
            });
    }
});
