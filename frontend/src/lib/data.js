// Static content of the site: default slider banners, starter vocabulary, module lessons
// and the small demo dictionary used by the admin bulk-vocabulary tool.
// Bangla text here is learning content and intentionally stays in Bangla.

export const ADMIN_EMAIL = 'ieltsvocabmaster@gmail.com';
export const DEFAULT_BOOK_RANGE = { start: 10, end: 19 };
export const TESTS = ['T1', 'T2', 'T3', 'T4'];
export const MODULE_NAMES = ['Reading', 'Listening', 'Writing', 'Speaking'];

export const MODULE_META = {
  Reading: { icon: 'fa-book-open-reader', navLabel: 'Reading Vault', cardSubtitle: 'Book 10-19' },
  Listening: { icon: 'fa-headphones', navLabel: 'Listening Audio', cardSubtitle: 'Book 10-19' },
  Writing: { icon: 'fa-pen-to-square', navLabel: 'Writing Tasks', cardSubtitle: 'Task 1 & Task 2' },
  Speaking: { icon: 'fa-microphone-lines', navLabel: 'Speaking Cue Cards', cardSubtitle: 'Cue Cards & Q/A' }
};

export const defaultBanners = [
  {
    tag: "FREE & PREMIUM IELTS PREP",
    title: "Book 10–19 Vocabulary & Solutions",
    desc: "All vocabulary from Test 1 of every book is completely free for everyone! Move ahead to unlock the next tests and the full test vault.",
    features: ["Book 10–19 Test 1 free", "Premium full vault", "Band 8.0 target solutions"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
  },
  {
    tag: "OFFICIAL IELTS BOOK MATERIAL",
    title: "Reading & Listening answer explanations",
    desc: "Line-by-line Bangla meaning of every tough question, tricky synonym matching and key words from the audio script, all in one click!",
    features: ["40 official tests", "Synonyms & antonyms", "Audio script notes"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80"
  },
  {
    tag: "PRO EXAM STRATEGY",
    title: "Writing & Speaking Band Booster",
    desc: "Stay ahead with ready-made formats for Task 1 and Task 2 and high-band vocabulary for the latest speaking cue cards.",
    features: ["Band 9.0 samples", "Latest cue cards", "Daily revision"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
  }
];

export const initialVocabulary = [
  {
    book: "Cambridge 10",
    test: "T1",
    word: "Cautiously",
    meaning: "সতর্কতার সাথে / সাবধানতার সাথে",
    synonyms: ["Carefully + সাবধানতার সাথে", "Prudently + বিচক্ষণতার সাথে"],
    antonyms: ["Carelessly + অসাবধানতাবশত", "Recklessly + বেপরোয়াভাবে"]
  },
  {
    book: "Cambridge 10",
    test: "T1",
    word: "Prevailed",
    meaning: "জয়ী হওয়া / বিদ্যমান থাকা",
    synonyms: ["Triumphed + জয়লাভ করেছিল", "Succeeded + সফল হয়েছিল"],
    antonyms: ["Failed + ব্যর্থ হয়েছিল", "Surrendered + আত্মসমর্পণ করেছিল"]
  }
];

export const moduleLessons = {
  Reading: {
    icon: 'fa-book-open-reader',
    subtitle: 'প্যাসেজ দ্রুত বুঝে নির্ভুলভাবে প্রশ্নের উত্তর দিন',
    explanation: 'Reading-এ শুধু দ্রুত পড়লেই হয় না—প্রশ্নের ধরন বুঝে প্যাসেজে প্রমাণ খুঁজে উত্তর দিতে হয়। প্রতিটি উত্তরের জন্য প্যাসেজের নির্দিষ্ট লাইন মিলিয়ে নিন।',
    steps: ['প্রথমে শিরোনাম ও প্রতিটি অনুচ্ছেদের প্রথম বাক্য দেখে মূল বিষয় ধরুন।', 'প্রশ্নে থাকা নাম, সংখ্যা ও মূল শব্দ চিহ্নিত করে প্যাসেজে স্ক্যান করুন।', 'প্রশ্নের বক্তব্য প্যাসেজের তথ্যের সঙ্গে মিলিয়ে TRUE, FALSE বা NOT GIVEN নির্ধারণ করুন।'],
  },
  Listening: {
    icon: 'fa-headphones',
    subtitle: 'শুনে নির্দিষ্ট তথ্য ধরুন এবং উত্তর লেখার অভ্যাস করুন',
    explanation: 'Listening-এ অডিও শুরুর আগে প্রশ্ন দেখে কী ধরনের উত্তর দরকার তা অনুমান করুন। বানান, একবচন-বহুবচন এবং শব্দসীমা মেনে উত্তর লিখুন।',
    steps: ['অডিও শুরুর আগে ফাঁকা জায়গার আশপাশের শব্দ পড়ে উত্তরটি নাম, তারিখ, সময় নাকি স্থান হবে বুঝুন।', 'শোনার সময় মূল শব্দের পাশাপাশি সমার্থক শব্দ ও বক্তার সংশোধন খেয়াল করুন।', 'শেষে উত্তরগুলোর বানান ও “ONE WORD” বা “NO MORE THAN TWO WORDS” নির্দেশনা মিলিয়ে নিন।'],
  },
  Writing: {
    icon: 'fa-pen-to-square',
    subtitle: 'প্রশ্ন বিশ্লেষণ করে গোছানো, প্রাসঙ্গিক উত্তর লিখুন',
    explanation: 'Writing-এ প্রশ্নের প্রতিটি অংশের উত্তর, অনুচ্ছেদের পরিষ্কার বিন্যাস এবং ধারণার যৌক্তিক সংযোগ গুরুত্বপূর্ণ। লেখা শুরু করার আগে ৩–৫ মিনিট পরিকল্পনা করুন।',
    steps: ['প্রশ্নের নির্দেশ—যেমন discuss, agree/disagree বা causes/solutions—চিহ্নিত করুন।', 'ভূমিকায় প্রশ্নটি নিজের ভাষায় তুলে ধরে স্পষ্ট অবস্থান জানান।', 'প্রতিটি বডি অনুচ্ছেদে একটি মূল বক্তব্য, ব্যাখ্যা ও উদাহরণ দিন; শেষে উত্তর যাচাই করুন।'],
  },
  Speaking: {
    icon: 'fa-microphone-lines',
    subtitle: 'Cue card-এ এক মিনিটে পরিকল্পনা করে সাবলীলভাবে বলুন',
    explanation: 'Speaking Part 2-তে একটি cue card নিয়ে এক মিনিট প্রস্তুতির পর এক থেকে দুই মিনিট কথা বলতে হয়। প্রতিটি bullet point স্পর্শ করে একটি ছোট গল্পের মতো উত্তর সাজান।',
    steps: ['এক মিনিটে চারটি bullet point-এর পাশে একটি করে মূল শব্দ লিখুন।', 'অতীত, বর্তমান ও ভবিষ্যৎ—এই ধারায় কথা সাজালে উত্তর স্বাভাবিকভাবে এগোয়।', 'কারণ, অনুভূতি ও একটি নির্দিষ্ট উদাহরণ যোগ করুন; মুখস্থ উত্তরের মতো শোনানো এড়িয়ে চলুন।'],
  }
};

// Texts used inside the interactive practice blocks of each lesson.
export const practiceText = {
  readingPrompt: 'উত্তর বেছে নিয়ে নিজের ধারণা যাচাই করুন।',
  readingCorrect: 'সঠিক! প্যাসেজে পাখির সংখ্যার ওপর প্রভাবের কথা বলা হয়েছে “not yet been studied”—এটি বাড়ে কি না তথ্য দেওয়া নেই।',
  readingWrong: 'আবার ভাবুন: প্যাসেজে পাখির ওপর দীর্ঘমেয়াদি প্রভাব এখনও গবেষণা করা হয়নি; বাড়ে বা কমে এমন তথ্য নেই।',
  listeningInstruction: 'নিচের অডিও একবার শুনুন। মিটিংয়ের দিনটি লিখুন।',
  listeningPrompt: 'প্রয়োজনে অডিও আবার শুনে উত্তর দিন।',
  listeningCorrect: 'সঠিক! বক্তা প্রথমে Tuesday বললেও পরে দিন পরিবর্তন করে Thursday বলেছেন।',
  listeningWrong: 'সঠিক উত্তর Thursday। বক্তা প্রথমে Tuesday বলার পর দিনটি সংশোধন করেছেন—এ ধরনের পরিবর্তন মনোযোগ দিয়ে শুনুন।',
  writingInstruction: 'নিজের অবস্থান এবং দুটি সমর্থনকারী কারণ নোট করুন। এটি পরিকল্পনার জায়গা; এখানে কোনো স্বয়ংক্রিয় AI মূল্যায়ন নেই।',
  writingSample: 'অবস্থান: শর্তসাপেক্ষে একমত। কারণ ১: বিনামূল্যে যাতায়াত যানজট ও ব্যক্তিগত গাড়ির ব্যবহার কমাতে পারে। কারণ ২: এতে নিম্ন-আয়ের মানুষের কর্মস্থল ও শিক্ষায় যাতায়াত সহজ হয়। বিপরীত দিক: খরচ মেটাতে কর বা সরকারি বাজেট প্রয়োজন—এটি সমাধানের অংশ হিসেবে আলোচনা করুন।',
  speakingNote: 'সময় শেষ হলে নোট না পড়ে ১–২ মিনিট নিজের উত্তর বলার অনুশীলন করুন।'
};

// Demo dictionary for the admin bulk-vocabulary preview (not an AI generator).
export const autoDict = {
  diligent: { meaning: 'পরিশ্রমী / যত্নশীল', synonyms: ['Hardworking', 'Assiduous'], antonyms: ['Lazy', 'Negligent'] },
  benevolent: { meaning: 'দয়ালু / পরোপকারী', synonyms: ['Kind-hearted', 'Altruistic'], antonyms: ['Cruel', 'Malicious'] },
  candid: { meaning: 'স্পষ্টবাদী / অকপট', synonyms: ['Frank', 'Outspoken'], antonyms: ['Secretive', 'Deceitful'] },
  resilient: { meaning: 'স্থিতিস্থাপক / ঘুরে দাঁড়াতে সক্ষম', synonyms: ['Strong', 'Adaptable'], antonyms: ['Fragile', 'Vulnerable'] },
  tenacious: { meaning: 'নাছোড়বান্দা / দৃঢ়প্রতিজ্ঞ', synonyms: ['Persistent', 'Determined'], antonyms: ['Weak', 'Yielding'] }
};
