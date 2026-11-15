const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || "moni_secret_verify_2026";
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN || "YOUR_PAGE_ACCESS_TOKEN";

const PRODUCT = {
  name: "প্রিমিয়াম ওয়্যারলেস নেকব্যান্ড Pro",
  price: "৮৫০ টাকা",
  stock: "স্টকে আছে (কালো ও নীল কালার)",
  insideDhaka: "৬০ টাকা (১-২ দিন)",
  outsideDhaka: "১২০ টাকা (২-৩ দিন)",
  bonus: "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি ও ক্যাশ অন ডেলিভারি"
};

const RULES = [
  {
    id: "price",
    keywords: ["দাম", "কত", "প্রাইস", "price", "rate", "tk", "টাকা", "হাদিয়া", "মুল্য", "মূল্য"],
    reply: `${PRODUCT.name}-এর বর্তমান অফার প্রাইস মাত্র ${PRODUCT.price} (সাথে ${PRODUCT.bonus})।`
  },
  {
    id: "delivery",
    keywords: ["ডেলিভারি", "চার্জ", "কুরিয়ার", "পাঠানো", "কয়দিন", "কবে পাবো", "delivery", "charge", "courier"],
    reply: `ঢাকার ভেতরে ডেলিভারি চার্জ ${PRODUCT.insideDhaka} এবং ঢাকার বাইরে ${PRODUCT.outsideDhaka}।`
  },
  {
    id: "stock",
    keywords: ["স্টক", "আছে কি", "কালার", "রঙ", "পাওয়া যাবে", "available", "stock", "color"],
    reply: `হ্যাঁ, আমাদের ${PRODUCT.name} বর্তমানে ${PRODUCT.stock}।`
  },
  {
    id: "order",
    keywords: ["অর্ডার", "নিতে চাই", "কিনবো", "কিভাবে", "লাগবে", "order", "buy", "inbox"],
    reply: `অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নম্বর আমাদের ইনবক্স করুন। পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন!`
  },
  {
    id: "complaint",
    keywords: ["নষ্ট", "ভাঙ্গা", "চেঞ্জ", "রিটার্ন", "ওয়ারেন্টি", "গ্যারান্টি", "warranty", "return"],
    reply: `ডেলিভারি ম্যানের সামনে পণ্য চেক করে নিতে পারবেন এবং থাকছে ${PRODUCT.bonus}।`
  },
  {
    id: "location",
    keywords: ["কোথায়", "দোকান", "শোরুম", "ঠিকানা", "লোকেশন", "location", "shop", "address"],
    reply: `আমাদের ডিসপ্লে সেন্টার মিরপুর-১০, ঢাকা। অনলাইনে অর্ডার করলে সারাদেশে ঘরে বসেই ডেলিভারি পাবেন।`
  }
];

const URGENT_NEGATIVE_KEYWORDS = ["লেট", "দেরি", "বাজে", "ফালতু", "প্রতারণা", "ধোঁকা", "পেলাম না", "রিসিভ করে না", "ফোন ধরে না", "স্ক্যাম", "খারাপ"];

function buildSmartReply(commentText, senderName) {
  const name = senderName || "ভাইয়া/আপু";
  const normalized = (commentText || "").toLowerCase();

  if (URGENT_NEGATIVE_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      publicReply: `প্রিয় ${name}, আপনার সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত! 🙏 অনুগ্রহ করে আপনার অর্ডার বা মোবাইল নম্বরটি আমাদের ইনবক্সে দিন, আমাদের সাপোর্ট টিম এখনই বিষয়টি সমাধান করছে।`,
      privateDm: `হ্যালো ${name}, আপনার কমেন্টটি আমাদের নজরে এসেছে। অনুগ্রহ করে আপনার মোবাইল নম্বরটি এখানে রিপ্লাই দিন, আমাদের প্রতিনিধি দ্রুত কল করছেন।`
    };
  }

  const matched = RULES.filter(rule => rule.keywords.some(kw => normalized.includes(kw.toLowerCase())));
  const core = matched.length > 0
    ? matched.map(m => m.reply).join(" এছাড়া, ")
    : `আমাদের ${PRODUCT.name} সম্পর্কে আগ্রহের জন্য ধন্যবাদ! আমাদের একজন প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।`;

  return {
    publicReply: `প্রিয় ${name}, অনেক ধন্যবাদ কমেন্ট করার জন্য! 😊 ${core} যেকোনো প্রয়োজনে আমাদের ইনবক্স করুন! 💙`,
    privateDm: `সালাম ${name}! 🌟 আপনার কমেন্টের প্রেক্ষিতে জানাচ্ছি—আমাদের "${PRODUCT.name}"-এর অফার প্রাইস ${PRODUCT.price} (${PRODUCT.stock})। অর্ডার কনফার্ম করতে আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নম্বরটি এখানে রিপ্লাই করুন! 🛍️`
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    try {
      const change = req.body?.entry?.[0]?.changes?.[0]?.value;
      if (change?.item === "comment" && change?.verb === "add" && change?.comment_id) {
        const commentText = change.message || "";
        const senderName = change.from?.name || "সম্মানিত ক্রেতা";
        const { publicReply, privateDm } = buildSmartReply(commentText, senderName);

        await fetch(`https://graph.facebook.com/v19.0/${change.comment_id}/comments?access_token=${PAGE_ACCESS_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: publicReply })
        });

        await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { comment_id: change.comment_id },
            message: { text: privateDm }
          })
        });
      }
    } catch (err) {
      console.error("Webhook error:", err);
    }
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method Not Allowed");
}

