# AI vocabulary worker (Gemini + Cloudflare, ফ্রি)

অ্যাডমিন প্যানেলের **Generate Vocabulary** বাটন এই Worker-এর মাধ্যমে Google Gemini থেকে প্রতিটা শব্দের বাংলা অর্থ, সিনোনিম, এন্টোনিম আর উদাহরণ আনে।

- Gemini API key শুধু Cloudflare-এ গোপন (Secret) হিসেবে থাকে, ওয়েবসাইটের কোডে বা GitHub-এ কখনও যায় না।
- শুধু ভেরিফাইড অ্যাডমিন অ্যাকাউন্ট (ieltsvocabmaster@gmail.com) এটা ব্যবহার করতে পারে। প্রতিটা অনুরোধে Firebase লগইন টোকেন যাচাই করা হয়।
- Worker সেট না থাকলে বা কাজ না করলে জেনারেটর আগের মতো ফ্রি অনলাইন ডিকশনারি ব্যবহার করে।

## সেটআপ (কোনো সফটওয়্যার লাগবে না, শুধু ব্রাউজার)

### ১. Gemini API key
1. https://aistudio.google.com/apikey খুলে Google অ্যাকাউন্ট দিয়ে লগইন করুন।
2. **Create API key** চাপুন, তারপর key কপি করুন।
3. key কাউকে দেবেন না, চ্যাটে বা কোডেও লিখবেন না।

### ২. Cloudflare Worker
1. https://dash.cloudflare.com এ ফ্রি অ্যাকাউন্ট খুলুন।
2. **Workers & Pages** → **Create** → **Create Worker** খুলুন। নাম দিন `ielts-vocab-ai`, তারপর **Deploy** চাপুন।
3. **Edit code** চাপুন। আগের সব কোড মুছে এই ফোল্ডারের [`worker.js`](worker.js) ফাইলের পুরো লেখা পেস্ট করুন, তারপর **Deploy** চাপুন।
4. Worker-এর **Settings** → **Variables and Secrets** → **Add** খুলুন।
   - Type: **Secret**
   - Name: `GEMINI_API_KEY`
   - Value: ধাপ ১-এর key

   তারপর **Deploy** চাপুন।
5. Worker-এর ঠিকানা কপি করুন (যেমন `https://ielts-vocab-ai.<আপনার-নাম>.workers.dev`)।

### ৩. ওয়েবসাইটে ঠিকানা বসানো
[`frontend/.env.production`](../../frontend/.env.production) ফাইলে `VITE_AI_WORKER_URL=` এর পরে Worker-এর ঠিকানা বসিয়ে GitHub-এ পুশ করুন। এই ঠিকানা গোপন নয়, Worker নিজেই অ্যাডমিন যাচাই করে।

## ঐচ্ছিক
- **মডেল বদলানো:** Worker-এর Variables-এ `GEMINI_MODEL` (Type: Text) যোগ করুন, যেমন `gemini-2.5-flash`। না দিলে প্রথমে `gemini-flash-latest`, তারপর `gemini-2.5-flash` চেষ্টা করা হয়।
- **ফ্রি সীমা:** Gemini-র ফ্রি টায়ারে প্রতি মিনিট আর প্রতিদিন কিছু সীমা আছে। জেনারেটর একবারে ২০টা শব্দ পাঠায়, তাই ২০০ শব্দে ১০টা অনুরোধ লাগে। সীমা ছাড়ালে বাকি শব্দ ডিকশনারি থেকে আসে।
- **গোপনীয়তা:** ফ্রি টায়ারে Google পাঠানো লেখা তাদের সেবা উন্নত করতে ব্যবহার করতে পারে। এখানে শুধু ইংরেজি শব্দ পাঠানো হয়, কোনো ব্যক্তিগত তথ্য নয়।
