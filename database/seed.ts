import { neon } from "@neondatabase/serverless";
import { categories } from "./schema";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({
  path: ".env.local",
});

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

const categoriesData = [
  {
    id: "6763ab49000252c1a4a3",
    name: "Tax Refunds",
    icon: "FaHandHoldingDollar",
    type: "income",
    color: "#FFEDD5",
    createdAt: new Date("2024-12-18T23:16:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "6763ab85001b5b4495f5",
    name: "Bonuses",
    icon: "FaSackDollar",
    type: "income",
    color: "#FED7E2",
    createdAt: new Date("2024-12-18T23:15:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "6763ab790002e60aa54a",
    name: "Wages",
    icon: "FaBriefcase",
    type: "income",
    color: "#E9D8FD",
    createdAt: new Date("2024-12-18T23:13:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "6763ab6a0020ff687e3f",
    name: "Salary",
    icon: "FaBriefcase",
    type: "income",
    color: "#BEE3F8",
    createdAt: new Date("2024-12-18T23:13:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "6763ab5b0026b14e4c58",
    name: "Shopping",
    icon: "FaCartShopping",
    type: "expense",
    color: "#C6F6D5",
    createdAt: new Date("2024-12-18T23:12:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "6763abd40002ec91dc2c",
    name: "Dining Out",
    icon: "FaChampagneGlasses",
    type: "expense",
    color: "#FEEBC8",
    createdAt: new Date("2024-12-18T23:11:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "6763ab3f0000da405345",
    name: "Entertainment",
    icon: "FaGamepad",
    type: "expense",
    color: "#FCD5CE",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "6763ab300015bdc4005a",
    name: "Snacks",
    icon: "FaCookieBite",
    type: "expense",
    color: "#FFFACD",
    createdAt: new Date("2024-12-18T23:12:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "6763ab160021142ea646",
    name: "Groceries",
    icon: "FaBasketShopping",
    type: "expense",
    color: "#FFEDD5",
    createdAt: new Date("2024-12-18T23:11:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "6763aaf00006febdfbef",
    name: "Food",
    icon: "FaUtensils",
    type: "expense",
    color: "#FED7E2",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "6763aad100146b4c4b1a",
    name: "Bills",
    icon: "FaReceipt",
    type: "expense",
    color: "#E9D8FD",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "6763aaa400223f57b446",
    name: "Housing",
    icon: "FaHouseCircleCheck",
    type: "expense",
    color: "#BEE3F8",
    createdAt: new Date("2024-12-18T23:09:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
];

type CategoryData = {
  name: string;
  icon: string;
  type: "EXPENSE" | "INCOME";
  color: string;
};

async function seedCategories() {
  for (const category of categoriesData) {
    const categoryData: CategoryData = {
      name: category.name,
      icon: category.icon,
      type: category.type === "expense" ? "EXPENSE" : "INCOME",
      color: category.color,
    };
    await db.insert(categories).values(categoryData);
    console.log(`Inserted category: ${category.name}`);
  }
}

seedCategories()
  .then(() => console.log("Seeding completed!"))
  .catch((error) => console.error("Seeding failed:", error));
