# IELTS VocabMaster

**IELTS Cambridge Prep & Vocabulary Master** — IELTS প্রস্তুতির জন্য বাংলা ব্যাখ্যা, চারটি অনুশীলন মডিউল এবং Cambridge-ভিত্তিক শব্দভাণ্ডারের একটি static web demo।

[রিপোজিটরি দেখুন](https://github.com/MelodexBD/ielts-vocabmaster)

> **বর্তমান অবস্থা:** এটি HTML, CSS ও JavaScript-নির্ভর static website—এর সঙ্গে কোনো backend, server-side account system বা কার্যকর payment gateway যুক্ত নেই। লগইন, অ্যাডমিন অ্যাক্সেস, অগ্রগতি ও কনটেন্ট browser-এর `localStorage`-এ রাখা হয়।

## ✨ বর্তমানে যা আছে

- **হোম ও ব্যানার স্লাইডার:** স্বয়ংক্রিয় স্লাইডসহ হোম স্ক্রিন; অ্যাডমিন প্যানেল থেকে একই browser-এ ব্যানার যোগ বা মুছতে পারবেন।
- **চারটি শেখার মডিউল:** Reading, Listening, Writing ও Speaking—প্রতিটিতে বাংলা নির্দেশনা, ধাপে ধাপে পরামর্শ এবং ছোট অনুশীলন আছে।
  - Reading-এ True / False / Not Given অনুশীলন ও উত্তর ব্যাখ্যা।
  - Listening-এ browser-এর speech synthesis দিয়ে শোনার অনুশীলন এবং উত্তর যাচাই।
  - Writing-এ essay-plan অনুশীলন, শব্দ গণনা ও নমুনা পরিকল্পনা।
  - Speaking-এ cue card, এক মিনিটের প্রস্তুতি টাইমার ও নোটের জায়গা।
- **Cambridge বই ও টেস্ট:** অ্যাডমিন প্যানেলে বইয়ের পরিসর ১–৯৯-এর মধ্যে নির্ধারণ করা যায়; প্রতিটি বইয়ে T1–T4 দেখানো হয়। সাধারণ ব্যবহারকারীর জন্য Cambridge 10 · T1 বিনামূল্যের নমুনা; বাকি বই ও টেস্টে লগইন/আপগ্রেডের demo lock দেখায়।
- **Vocabulary:** Cambridge বই ও টেস্টভিত্তিক শব্দ, বাংলা অর্থ, synonym ও antonym দেখানো হয়। শুরুতে দুটি নমুনা শব্দ আছে; অ্যাডমিন Reading-এর জন্য একসঙ্গে একাধিক শব্দ যোগ করতে পারেন।
- **ব্যবহারকারীর অগ্রগতি:** সাধারণ ব্যবহারকারী লগইন অবস্থায় মডিউল ও টেস্ট সম্পন্ন হিসেবে চিহ্নিত করে অগ্রগতির শতাংশ দেখতে পারেন। এটি ব্যবহারকারীর নিজের চিহ্নিতকরণের হিসাব—উত্তর মূল্যায়ন করে তৈরি স্কোর নয়; demo account-গুলোর জন্য আলাদা server-side progress নেই।
- **Guest ও অ্যাডমিন অভিজ্ঞতা:** Guest-দের locked content খুলতে লগইন prompt দেখায়। `ieltsvocabmaster@gmail.com` ইমেইলে চিহ্নিত অ্যাডমিনের জন্য সব বই ও টেস্ট খোলা থাকে; অ্যাডমিন ভিউতে অগ্রগতির শতাংশ দেখানো হয় না।
- **অ্যাডমিন প্যানেল:** Cambridge বইয়ের পরিসর, স্লাইডার ব্যানার এবং Reading, Listening, Writing ও Speaking-এর কনটেন্ট ফর্ম আছে। Reading-এর bulk vocabulary preview-তে বাংলা অর্থ, synonym/antonym ও চারটি করে উদাহরণ সম্পাদনা করে প্রকাশ করা যায়; অন্য মডিউলের জন্য একই card ও live-preview মডেলের আলাদা ফর্ম আছে। হোমের চারটি মডিউল সেকশনের জন্যও বিষয়ভিত্তিক পরিচিতি, audio, prompt বা cue-card কনটেন্ট আলাদাভাবে আপলোড করা যায়।
- **Responsive নেভিগেশন:** ছোট পর্দায় তিন-লাইন মডিউল মেনু, আর বড় পর্দায় sidebar navigation।

## 🧰 প্রযুক্তি

- Static **HTML, CSS ও JavaScript**; `index.html`-এর মূল অভিজ্ঞতায় inline JavaScript ব্যবহার করা হয়েছে।
- **Tailwind CSS** CDN, **Font Awesome 6** CDN এবং **Google Fonts** (Hind Siliguri ও Plus Jakarta Sans)।
- অতিরিক্ত stylesheet: `style.css`।
- ব্যবহারকারীর অবস্থা ও সম্পাদিত ডেটার জন্য browser `localStorage`।

## 🚀 স্থানীয়ভাবে চালান

কোনো package install বা build ধাপ নেই।

**সহজ উপায়:** `index.html` ফাইলটি browser-এ খুলুন।

**অথবা static web server চালান** (Python থাকলে):

```bash
python -m http.server 8000
```

তারপর browser-এ <http://localhost:8000> খুলুন। `admin.html` ও অন্যান্য পেজও একই server origin-এ খুলুন—তাহলে পেজগুলোর `localStorage` একই থাকবে।

## 🌐 GitHub Pages-এ প্রকাশ

1. GitHub repository-র **Settings → Pages** খুলুন।
2. **Deploy from a branch** নির্বাচন করে `main` branch এবং `/(root)` folder নির্ধারণ করুন।
3. সংরক্ষণের পর Pages-এর build শেষ হলে প্রকাশিত সাইটের URL-এ `index.html` খুলুন।

এই repository-র root-এ `index.html` আছে বলে root deployment উপযুক্ত। GitHub Pages-এ প্রকাশিত কপি এবং `localhost` আলাদা origin—একটির `localStorage` অন্যটিতে দেখা যাবে না। Tailwind, Font Awesome ও Google Fonts লোড করতে ইন্টারনেট সংযোগও প্রয়োজন।

## ⚠️ ডেটা, লগইন ও নিরাপত্তার সীমা

- `localStorage` শুধু **একই browser profile ও site origin**-এ থাকে; অন্য browser, device, `file://`, `localhost` বা GitHub Pages-এ স্বয়ংক্রিয়ভাবে যায় না। Browser data মুছে গেলে বা storage সীমা পূর্ণ হলে ডেটা হারাতে পারে বা সেভ ব্যর্থ হতে পারে।
- অ্যাডমিনের ব্যানার, বইয়ের পরিসর, শব্দ ও module-form-এর ডেটা server-এ বা GitHub repository-তে প্রকাশিত হয় না। একই device/browser-এর একই origin-এ site খুললে তবেই সেই browser-এর সংরক্ষিত ডেটা পাওয়া যায়। নতুন visitor-এর জন্য GitHub Pages-এ কনটেন্ট পৌঁছাতে repository-র source data বদলানো বা backend-এ সংরক্ষণের ব্যবস্থা প্রয়োজন।
- সাইন-আপ/লগইন এখন demo flow: পাসওয়ার্ড server-এ যাচাই বা সংরক্ষণ হয় না; Google বোতামও প্রকৃত Google OAuth নয়। Browser storage-এ রাখা token/email পরিবর্তন করে পরিচয় বদলানো সম্ভব।
- `ieltsvocabmaster@gmail.com`-এর অ্যাডমিন গেটটি client-side এবং নিরাপদ authorization নয়। Browser-এর developer tools দিয়ে এটি এড়িয়ে যাওয়া যায়। বাস্তব ব্যবহারকারীর তথ্য বা গোপন কনটেন্ট সুরক্ষার জন্য এটি ব্যবহার করবেন না।
- Upgrade, bKash/Nagad নির্বাচন ও payment confirmation কেবল UI/demo আচরণ—বাস্তব payment বা subscription সক্রিয় করে না।
- Bulk vocabulary preview **AI দিয়ে শব্দ তৈরি করে না**। এতে পাঁচটি hard-coded demo শব্দের dictionary আছে: `diligent`, `benevolent`, `candid`, `resilient` ও `tenacious`। অন্য শব্দ preview-তে ফাঁকা অর্থ/synonym/antonym নিয়ে আসে; প্রকাশের আগে প্রয়োজনীয় তথ্য নিজে পূরণ করতে হয়। Part of speech ও উদাহরণ ঐচ্ছিক।
- Reading vocabulary, banner image ও অন্যান্য browser-এ সেভ করা ডেটা `localStorage`-এর জায়গা ব্যবহার করে; বড় ছবি বা বেশি ডেটা browser-এর storage limit ছাড়াতে পারে।

## 🗂️ Repository-র ফাইল

সব পৃষ্ঠা ও stylesheet repository-র root-এ রয়েছে:

| ফাইল | কাজ |
| --- | --- |
| `index.html` | প্রধান landing experience: slider, module lesson/practice, Cambridge বই-টেস্ট নির্বাচন, vocabulary ও অগ্রগতি |
| `admin.html` | Browser-local admin demo: বইয়ের পরিসর, banner এবং module content form |
| `signup.html` | Demo login ও sign-up UI |
| `style.css` | পৃথক practice/dashboard পৃষ্ঠাগুলোর shared style |
| `dashboard.html` | পৃথক dashboard screen |
| `reading.html` | পৃথক Reading practice screen |
| `listening.html` | পৃথক Listening screen |
| `writing.html` | পৃথক Writing practice screen |
| `speaking.html` | পৃথক Speaking cue-card screen |
| `vocabulary.html` | পৃথক Vocabulary Vault screen |
| `favourite.html` | পৃথক Favourites screen |

## 🔭 ভবিষ্যতের সম্ভাব্য কাজ

নিচেরগুলো **প্রস্তাবিত ভবিষ্যৎ উন্নয়ন; বর্তমান implementation নয়**:

- server-side authentication, প্রকৃত Google OAuth ও role-based authorization;
- ব্যবহারকারীভিত্তিক database, cloud backup ও বিভিন্ন device-এ data sync;
- নিরাপদ backend-নিয়ন্ত্রিত content management ও প্রকাশনা;
- যাচাইকৃত payment gateway, subscription এবং server-side entitlement;
- bulk vocabulary-র জন্য বিস্তৃত যাচাইকৃত dictionary বা ঐচ্ছিক AI service।
