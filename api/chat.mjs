import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "لم يتم إرسال رسالة."
            });
        }

        const q = message
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

        if (keywords.some(word => q.includes(word))) {
            return res.json({
                reply: "تم تطويري بواسطة المهندس محمد إبراهيم محمد أحمد عامر."
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
            `,
            input: message
        });

        return res.json({
            reply: response.output_text
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي."
        });
    }
}
