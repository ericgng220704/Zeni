# Zeni V1

**Zeni V1** is a personal expense management application designed and developed by **Eric Nguyen** (<giahaonguyen2207@gmail.com>). This application empowers users to take control of their finances with features like multi-user balance management, detailed transaction tracking, intuitive budget monitoring, and an innovative in-app chatbot for guidance and actions.

Link to the app: https://zeni-ericgng.vercel.app/

> **Note:** This repository is a personal project. The code is provided for demonstration purposes only. Please do not clone, distribute, or reuse it without explicit permission.

## Overview

Zeni V1 is a modern web application that offers a comprehensive solution for managing both personal and shared finances. Whether you're tracking everyday expenses, setting and monitoring budgets, or collaborating with others on a shared balance, Zeni V1 provides an intuitive experience enriched with dynamic visualizations and smart automation through its integrated chatbot.

## Features

### Balances

- **Multi-User Collaboration:**
  Manage a single balance with support for multiple users.
- **Email Invitations:**
  Only the balance owner can invite new users via email.
- **Detailed Visualizations:**
  Access a dedicated balance detail page with visual insights into income and expenses over time and by category.
- **Recurring Transactions:**
  Effortlessly manage recurring income and expense transactions.

### Transactions (Expense / Income)

- **Full CRUD Operations:**
  Create, update, delete, and view your transactions with ease.
- **Advanced Organization:**
  Group transactions by date with robust filtering and sorting capabilities.

### Budgets

- **Comprehensive Budget Management:**
  Set up and manage budgets tailored to your needs.
- **Real-Time Notifications:**
  Receive alerts on the transaction page when your spending nears or exceeds your set limits.
- **Interactive Data Visualization:**
  Explore detailed budget insights on a dedicated page to better understand your financial health.

### User Profile

- **Customizable Defaults:**
  Select a default balance to be showcased on the transaction and budget pages.
- **Personalization Options:**
  Modify your profile color (affecting chart visuals and chatbot messages) and update your name.

### Chatbot

- **Dual Functionality:**
  - **Question Model:** Provides answers to “how-to” queries, explains app features, and offers guidance on usage.
  - **Command Model:** Executes actions within the app through natural language prompts (initially focused on balance management, with further expansion planned).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Neon
- **ORM:** Drizzle ORM
- **Workflow:** QStash
- **Authentication:** Auth.js
- **Frontend:** shadcn & Tailwind CSS

## License

This project is a personal work by Eric Nguyen and is not intended for public cloning or commercial distribution without explicit permission. All rights reserved.
