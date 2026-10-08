# IELTS VocabMaster

**IELTS Cambridge Prep & Vocabulary Master** — Cambridge IELTS 10–19 প্রস্তুতির ওয়েবসাইট: বাংলা অর্থসহ শব্দভাণ্ডার, চারটি মডিউলের অনুশীলন, লগইন, অগ্রগতি সংরক্ষণ এবং অ্যাডমিন প্যানেল।

লাইভ সাইট: <https://melodexbd.github.io/ielts-vocabmaster/>

## 🧰 প্রযুক্তি

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Firebase Authentication (ইমেইল-পাসওয়ার্ড ও Google) এবং Cloud Firestore
- **হোস্টিং:** GitHub Pages — `main` ব্রাঞ্চে `frontend/`-এ পরিবর্তন পুশ করলে GitHub Actions নিজে থেকে build করে লাইভ সাইট আপডেট করে।

## 🗂️ ফোল্ডার

```
frontend/                 ওয়েবসাইট (React অ্যাপ)
  src/pages/              পেজ: Home, BookList, BookDetails, Practice, Login, Admin
  src/components/         Header, Sidebar, MobileNav, Footer, Slider, Modals ইত্যাদি
  src/context/            লগইন অবস্থা, সাইটের কনটেন্ট ও পপআপের শেয়ার করা state
  src/lib/                Firebase সংযোগ, স্থির কনটেন্ট (data.js), টোস্ট ও লোডিং স্ক্রিন
  public/                 সরাসরি পরিবেশিত ফাইল (পুরনো ডেমো পেজ ও open-in-browser.js)
backend/
  firestore.rules         ডাটাবেসের নিরাপত্তা নিয়ম
  firebase.json
.github/workflows/pages.yml   build ও deploy
```

## 🚀 নিজের কম্পিউটারে চালানো

[Node.js](https://nodejs.org/) (LTS) লাগবে।

```bash
cd frontend
npm install       # প্রথমবার
npm run dev       # http://localhost:5173/ielts-vocabmaster/ এ চালু হবে
npm run build     # লাইভের মতো build (dist/ ফোল্ডারে)
```

## 🔐 Firebase

- ডাটাবেসের নিয়ম বদলালে `backend/firestore.rules`-এর লেখা Firebase Console → Firestore Database → **Rules**-এ পেস্ট করে **Publish** করুন (এটি নিজে থেকে আপলোড হয় না)।
- অ্যাডমিন: `ieltsvocabmaster@gmail.com` (ইমেইল যাচাই করা থাকতে হবে; Google দিয়ে লগইন করলে নিজে থেকে যাচাই হয়)।
- কাউকে প্রিমিয়াম দিতে: Firestore → `users` → সেই ইউজারের ডকুমেন্টে `premium` (boolean) = `true`।

## ⚠️ সীমাবদ্ধতা

- bKash/Nagad পেমেন্ট এখনো যুক্ত হয়নি; প্রিমিয়াম প্ল্যান বাছাই শুধু ডেমো।
- কনটেন্ট পড়ার অনুমতি সবার আছে; PRO লক এখন শুধু দেখানোর জন্য — পেমেন্ট যুক্ত করার সময় নিরাপত্তা নিয়মে প্রয়োগ করতে হবে।
- অ্যাডমিনের bulk vocabulary preview AI নয়; পাঁচটি demo শব্দের ছোট dictionary আছে, বাকিগুলোর অর্থ নিজে লিখতে হয়।
