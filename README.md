# 🤖 UDD AI Student Assistance Chatbot

An AI-powered chatbot prototype designed to provide students of **Universidad de Dagupan (UDD)** with fast, accessible, and intelligent assistance for common academic, administrative, and campus-related inquiries.

This project serves as a prototype for an AI student assistance system that can help reduce repetitive inquiries and improve access to university information.

---

## 📌 Project Overview

Students often need to ask questions regarding:

* Enrollment procedures
* Academic requirements
* University offices and services
* Campus locations
* School policies
* Class and examination schedules
* Student services
* Frequently asked questions

The **UDD AI Student Assistance Chatbot** aims to provide a centralized conversational interface where students can ask questions using natural language and receive relevant information quickly.

> ⚠️ **Prototype Notice:**
> This project is currently a prototype and is intended for educational, research, and demonstration purposes. It is not an official replacement for the university's existing systems or personnel.

---

## 🎯 Objectives

The main objectives of this project are to:

* Provide students with instant assistance through an AI-powered chatbot.
* Reduce repetitive inquiries directed to university offices.
* Improve access to frequently requested university information.
* Demonstrate the potential of Artificial Intelligence in university student services.
* Create a foundation for a future university-wide student assistance platform.

---

## ✨ Key Features

### 💬 AI Conversational Assistance

Students can ask questions using natural language, such as:

> "How can I enroll?"

> "Where is the Registrar's Office?"

> "What are the requirements for requesting a transcript?"

The chatbot processes the question and provides an appropriate response based on the available knowledge base.

---

### 📚 University Knowledge Base

The chatbot can be configured with information about:

* University departments
* Student services
* Enrollment procedures
* Academic policies
* Office locations
* Frequently Asked Questions
* Campus announcements
* Student guidelines

---

### 🧠 AI-Powered Responses

The system uses an AI model to understand student questions and generate conversational responses.

Possible AI integrations include:

* Google Gemini API
* OpenRouter API
* DeepSeek API
* Other Large Language Model APIs

---

### 🏫 Universidad de Dagupan-Focused Information

The chatbot is designed specifically around the needs of students from **Universidad de Dagupan**.

Potential information categories include:

* 🎓 Academic Assistance
* 📝 Enrollment Guidance
* 🏢 Office and Department Information
* 📍 Campus Navigation
* 📅 Academic Calendar
* 📢 University Announcements
* 💳 Student Finance Information
* ❓ Frequently Asked Questions

---

## 🏗️ System Architecture

```text
┌────────────────────────┐
│        Student         │
│   Touchscreen / Web    │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│    Chatbot Interface   │
│   React / Next.js UI   │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│      Backend API       │
│  Authentication / API  │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│       AI Model         │
│ Gemini / DeepSeek / LLM│
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│    University Data     │
│  Firebase / Knowledge  │
│        Base             │
└────────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript
* React.js / Next.js

### Backend and Database

* Firebase
* Firebase Firestore
* Firebase Authentication
* Firebase Hosting

### Artificial Intelligence

* Google Gemini API
* OpenRouter API
* DeepSeek API

### Optional Hardware

The chatbot can also be deployed as a physical campus kiosk using:

* Raspberry Pi 5
* 15.6-inch touchscreen monitor
* USB microphone
* Speakers
* Wi-Fi connection

---

## 📂 Example Project Structure

```text
udd-ai-chatbot/
│
├── app/
│   ├── page.js
│   ├── chatbot/
│   └── api/
│
├── components/
│   ├── ChatWindow.jsx
│   ├── MessageBubble.jsx
│   └── ChatInput.jsx
│
├── lib/
│   ├── firebase.js
│   └── ai.js
│
├── public/
│   └── assets/
│
├── .env.local
├── package.json
└── README.md
```

---

## 🔄 How the Chatbot Works

1. The student submits a question.
2. The chatbot receives the question.
3. The system analyzes the student's intent.
4. Relevant university information is retrieved from the knowledge base.
5. The AI generates a natural-language response.
6. The response is displayed to the student.

### Example

```text
Student:
"Where can I request my transcript of records?"

        ↓

AI Chatbot:
"Your Transcript of Records may be requested through the
appropriate university office. Please verify the latest
requirements and procedures with the Registrar's Office."
```

---

## 🔐 Data Privacy and Security

The system should be designed with student privacy in mind.

Important considerations include:

* Do not expose sensitive student information.
* Protect API keys using environment variables.
* Implement secure authentication.
* Limit access to private student records.
* Avoid sending unnecessary personal information to AI services.
* Follow applicable data privacy policies and regulations.

---

## 🚀 Future Improvements

Future versions of the project may include:

* 🔑 Student ID authentication
* 🧑‍🎓 Personalized student assistance
* 📊 Student academic information
* 🗺️ Interactive campus navigation
* 🚌 Campus transportation schedules
* 📢 Real-time announcements
* 🗣️ Voice interaction
* 📷 QR code integration
* 🖥️ Physical AI kiosk deployment
* 📚 AI-powered academic guidance
* 🧠 Retrieval-Augmented Generation (RAG)
* 📱 Mobile application support

---

## 🎓 Project Purpose

This project was developed as a prototype to explore the use of **Artificial Intelligence, conversational interfaces, and modern software technologies** in improving student assistance services.

The project demonstrates how AI can potentially help students access university-related information more efficiently through a simple and interactive chatbot interface.

---

## 👨‍💻 Developer

**Kenji D. Sakamoto**

Computer Engineering Student
**Universidad de Dagupan**

### Areas of Interest

* Artificial Intelligence
* Software Development
* Embedded Systems
* Robotics
* Web Development
* Human-Computer Interaction

---

## 📄 Project Status

🚧 **Prototype / Under Development**

This project is continuously being improved and may receive additional features, system integrations, and improvements in AI capabilities.

---

## ⭐ Support

If you find this project interesting, feel free to explore the project, provide feedback, and suggest improvements.

> Built with curiosity, technology, and the goal of making student assistance more accessible through AI. 🤖🎓
