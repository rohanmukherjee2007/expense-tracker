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
}

async function deleteExpense(expenseID) {
    const data = await readExpenses();
    const newData = data.filter((record) => {
        if (record.id !== expenseID) {
            return true;
        }
    });
    await writeExpenses(newData);
}

async function updateExpense(expenseID, name, category, amount, date) {
    const data = await readExpenses();
    data.forEach((expense) => {
        if (expense.id === expenseID) {
            expense.name = name;
            expense.category = category;
            expense.amount = amount;
            expense.date = date;
        }
    });
    await writeExpenses(data);
}

async function readBudget() {
    const data = await fs.promises.readFile(budgetsPath, "utf-8");
    return JSON.parse(data);
}

async function writeBudget(budget) {
    await fs.promises.writeFile(budgetsPath, JSON.stringify(budget, null, 2));
}

async function checkDuplicateCategory(category) {
    const budget = await readBudget();
    if (category in budget) {
        return true;
    } else {
        return false;
    }
}

async function addNewCategory(category, amount) {
    const budget = await readBudget();
    budget[category] = amount;
    await writeBudget(budget);
}

async function deleteCategory(category) {
    const budget = await readBudget();
    delete budget[category];
    await writeBudget(budget);
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

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
