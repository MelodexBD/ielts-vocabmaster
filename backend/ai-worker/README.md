# Cloudflare: ওয়েবসাইট হোস্টিং + AI vocabulary (ফ্রি)

একটাই Cloudflare Worker (`ielts-vocabmaster`) দুটো কাজ করে:

1. **ওয়েবসাইট হোস্ট করে:** `frontend/dist`-এর ফাইলগুলো পরিবেশন করে। GitHub-এর `main`-এ পুশ করলে Cloudflare নিজে বিল্ড করে লাইভ করে।
2. **`/api/vocabulary`:** অ্যাডমিন প্যানেলের **Generate Vocabulary** এখান থেকে Google Gemini-র মাধ্যমে বাংলা অর্থ, সিনোনিম, এন্টোনিম আর উদাহরণ আনে।

নিরাপত্তা:
- Gemini API key শুধু Cloudflare-এ Secret হিসেবে থাকে, কোডে বা GitHub-এ যায় না।
- শুধু ভেরিফাইড অ্যাডমিন অ্যাকাউন্ট (ieltsvocabmaster@gmail.com) AI ব্যবহার করতে পারে। প্রতিটা অনুরোধে Firebase লগইন টোকেন যাচাই হয়।
- AI কাজ না করলে জেনারেটর ফ্রি অনলাইন ডিকশনারি ব্যবহার করে।

ফাইল:
- [`worker.js`](worker.js): Worker-এর কোড
- [`frontend/wrangler.jsonc`](../../frontend/wrangler.jsonc): Cloudflare Workers-এর সেটিং
- [`frontend/functions/api/vocabulary.js`](../../frontend/functions/api/vocabulary.js): Cloudflare Pages-এ একই AI কোড চালায়

> **Cloudflare Pages দিয়ে করলে** (ঠিকানা `*.pages.dev`): Build command `npm run build:cloudflare`, Build output directory `dist`, Root directory `frontend`। Deploy command লাগে না। Gemini key দিতে হয় Pages প্রজেক্টের **Settings** → **Variables and Secrets**-এ।

## সেটআপ (শুধু ব্রাউজার, কোনো সফটওয়্যার লাগবে না)

### ১. GitHub রিপো যুক্ত করা
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Connect GitHub** খুলুন। GitHub-এ অনুমতি দিন, তারপর `MelodexBD/ielts-vocabmaster` রিপো বেছে নিন।
2. সেটিং দিন:
   | ঘর | মান |
   |---|---|
   | Project name | `ielts-vocabmaster` |
   | Build command | `npm run build:cloudflare` |
   | Deploy command | `npx wrangler deploy` |
   | Root directory (Advanced settings / Path) | `frontend` |
3. **Deploy** চাপুন। কয়েক মিনিটে সাইট চালু হবে, ঠিকানা হবে `https://ielts-vocabmaster.<আপনার-নাম>.workers.dev`।

### ২. Gemini API key (ফ্রি)
1. https://aistudio.google.com/apikey খুলে **Create API key** চাপুন, তারপর key কপি করুন।
2. Cloudflare-এ Worker `ielts-vocabmaster` খুলে **Settings** → **Variables and Secrets** → **Add**:
   - Type: **Secret**
   - Name: `GEMINI_API_KEY`
   - Value: key

   তারপর **Deploy** চাপুন।
3. key কাউকে দেবেন না, চ্যাটে বা কোডেও লিখবেন না।

### ৩. Firebase-এ নতুন ঠিকানার অনুমতি
Firebase Console → **Authentication** → **Settings** → **Authorized domains** → **Add domain**-এ `ielts-vocabmaster.<আপনার-নাম>.workers.dev` যোগ করুন। এটা না করলে নতুন ঠিকানায় "Continue with Google" কাজ করবে না।

## ঐচ্ছিক
- **নিজের ডোমেইন:** Worker-এর **Settings** → **Domains & Routes** থেকে যোগ করা যায়। সেই ডোমেইনও Firebase-এর Authorized domains-এ দিতে হবে।
- **মডেল বদলানো:** Variables-এ `GEMINI_MODEL` (Type: Text) দিন, যেমন `gemini-2.5-flash`। না দিলে প্রথমে `gemini-flash-latest`, তারপর `gemini-2.5-flash` চেষ্টা করা হয়।
- **ফ্রি সীমা:** Gemini-র ফ্রি টায়ারে প্রতি মিনিট আর প্রতিদিন সীমা আছে। জেনারেটর একবারে ২০টা শব্দ পাঠায়। সীমা ছাড়ালে বাকি শব্দ ডিকশনারি থেকে আসে।
- **গোপনীয়তা:** ফ্রি টায়ারে Google পাঠানো লেখা সেবা উন্নত করতে ব্যবহার করতে পারে। এখানে শুধু ইংরেজি শব্দ পাঠানো হয়।
- **GitHub Pages:** পুরনো ঠিকানা (melodexbd.github.io/ielts-vocabmaster) আপাতত আগের মতো চলবে। সেখানে AI জেনারেটর নেই, শুধু ডিকশনারি পদ্ধতি চলে।
