import express from "express";
import ejs from "ejs";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const expensesPath = path.join(__dirname, "data", "expenses.json");
const budgetsPath = path.join(__dirname, "data", "budgets.json");

async function readExpenses() {
    const data = await fs.promises.readFile(expensesPath, "utf-8");
    return JSON.parse(data);
}

async function writeExpenses(expenses) {
    await fs.promises.writeFile(expensesPath, JSON.stringify(expenses, null, 2));
}

async function createNewExpense(name, category, amount, date) {
    const id = uuidv4();
    const data = await readExpenses();
    const newExpense = {
        id: id,
        name: name,
        category: category,
        amount: amount,
        date: date
    };
    data.push(newExpense);
    await writeExpenses(data);
    return newExpense;
}

async function deleteExpense(expenseID) {
    const data = await readExpenses();
    const newData = data.filter((expense) => {
        if (expense.id !== expenseID) {
            return true;
        }
    });
    await writeExpenses(newData);
    return expenseID;
}

async function updateExpense(expenseID, name, category, amount, date) {
    const data = await readExpenses();
    let updatedExpense;
    data.forEach((expense) => {
        if (expense.id === expenseID) {
            expense.name = name;
            expense.category = category;
            expense.amount = amount;
            expense.date = date;
            updatedExpense = expense;
        }
    });
    await writeExpenses(data);
    return updatedExpense;
}

async function readBudget() {
    const data = await fs.promises.readFile(budgetsPath, "utf-8");
    return JSON.parse(data);
}

async function writeBudget(budget) {
    await fs.promises.writeFile(budgetsPath, JSON.stringify(budget, null, 2));
}

async function addNewCategory(category, amount) {
    const budget = await readBudget();
    budget[category] = amount;
    await writeBudget(budget);
    return {
        category: category,
        amount: amount
    };
}

async function deleteCategory(category) {
    const budget = await readBudget();
    delete budget[category];
    await writeBudget(budget);
    return category;
}

async function changeToUncategorized(category) {
    const data = await readExpenses();
    data.forEach((expense) => {
        if (expense.category === category) {
            expense.category = "Uncategorized";
        }
    });
    await writeExpenses(data);
}

app.get("/", async (req, res) => {
    const expenses = await readExpenses();
    const budgets = await readBudget();
    res.render("index.ejs", { expenses, budgets });
});

app.post("/expenses", async (req, res) => {
    const expenseBody = req.body;
    const { name, category, amount, date } = expenseBody;
    const expense = await createNewExpense(name, category, amount, date);
    res.status(201);
    res.json(expense);
});

app.put("/expenses/:id", async (req, res) => {
    const expenseBody = req.body;
    const { name, category, amount, date } = expenseBody; 
    const expenseID = req.params.id;
    const updatedExpense = await updateExpense(expenseID, name, category, amount, date);
    res.status(200);
    res.json(updatedExpense);
});

app.delete("/expenses/:id", async (req, res) => {
    const expenseID = req.params.id;
    const deletedID = await deleteExpense(expenseID);
    res.status(200);
    res.json(deletedID);
});

app.post("/categories", async (req, res) => {
    const budgetBody = req.body;
    const { category, amount } = budgetBody;
    const newCategory = await addNewCategory(category, amount);
    res.status(201);
    res.json(newCategory);
});

app.put("/categories/:name", async (req, res) => {
    const categoryName = req.params.name;
    const { amount } = req.body;
    const updatedCategory = await addNewCategory(categoryName, amount);
    res.status(200);
    res.json(updatedCategory);
});

app.delete("/categories/:name", async (req, res) => {
   const categoryName = req.params.name;
   if (categoryName === "Uncategorized") {
        res.status(403);
        res.json("Uncategorized cannot be deleted");
   } else {
        await deleteCategory(categoryName);
        await changeToUncategorized(categoryName);
        res.status(200);
        res.json(`Deleted ${categoryName}`);
   }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
