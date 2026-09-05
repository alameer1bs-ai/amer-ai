import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


function isDeveloperQuestion(text) {

    const q = text
        .toLowerCase()
        .replace(/[؟?!.,]/g, "");

    const keywords = [
        "مين صنعك",
        "من صنعك",
        "مين اخترعك",
        "من اخترعك",
        "مين طورك",
        "من طورك",
        "مين مطورك",
        "من مطورك",
        "مين برمجك",
        "من برمجك",
        "مين صممك",
        "من صممك"
    ];

    return keywords.some(word => q.includes(word));
}


export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        const {
            message,
            history = []
        } = req.body;


        if (!message) {

            return res.status(400).json({
                error: "لم يتم إرسال رسالة."
            });

        }


        // سؤال المطور
        if (isDeveloperQuestion(message)) {

            return res.json({
                reply:
                    "تم تطويري بواسطة المهندس محمد إبراهيم محمد أحمد عامر."
            });

        }


        // تجهيز سجل المحادثة
        const conversation = history
            .filter(item =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-20)
            .map(item => ({
                role: item.role,
                content: item.content
            }));


        // التأكد من عدم تكرار الرسالة الحالية
        const lastMessage = conversation[conversation.length - 1];

        if (
            !lastMessage ||
            lastMessage.role !== "user" ||
            lastMessage.content !== message
        ) {

            conversation.push({
                role: "user",
                content: message
            });

        }


        const response = await openai.responses.create({

            model: "gpt-5.6-luna",

            instructions: `
أنت AMER AI، مساعد ذكاء اصطناعي عربي.

كن مفيدًا وواضحًا وودودًا.

إذا تحدث المستخدم بالعربية، أجب بالعربية.
إذا تحدث المستخدم بالإنجليزية، أجب بالإنجليزية.

معلومة أساسية:
تم تطوير AMER AI بواسطة المهندس محمد إبراهيم محمد أحمد عامر.

مهم جدًا:
استخدم سجل المحادثة السابق لفهم سياق كلام المستخدم.
إذا أخبرك المستخدم بمعلومة مثل اسمه أو اهتماماته، يمكنك استخدامها في الأسئلة اللاحقة داخل نفس المحادثة.
إذا سألك المستخدم عن معلومة قالها سابقًا، ارجع إلى سياق المحادثة وأجب بناءً عليه.
`,

            input: conversation

        });


        return res.json({

            reply:
                response.output_text ||
                "لم أتمكن من إنشاء رد."

        });


    } catch (error) {

        console.error("OpenAI Error:", error);

        // إظهار الخطأ الحقيقي لمعرفة سبب توقف الموقع
        return res.status(500).json({

            error:
                error?.message ||
                "حدث خطأ غير معروف",

            status:
                error?.status ||
                500

        });

    }

}
