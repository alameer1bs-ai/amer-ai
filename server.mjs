import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("."));

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

app.post("/api/chat", async (req, res) => {

    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: "لم يتم إرسال رسالة."
            });
        }

        // السؤال عن مطور AMER AI
        if (isDeveloperQuestion(message)) {
            return res.json({
                reply:
                    "تم تطويري بواسطة المهندس محمد إبراهيم محمد أحمد عامر."
            });
        }

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",

            instructions: `
أنت AMER AI، مساعد ذكاء اصطناعي عربي.

كن مفيدًا وواضحًا وودودًا.
إذا تحدث المستخدم بالعربية، أجب بالعربية.
إذا تحدث بالإنجليزية، أجب بالإنجليزية.

معلومة أساسية:
تم تطوير AMER AI بواسطة المهندس محمد إبراهيم محمد أحمد عامر.
            `,

            input: message
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي."
        });
    }
});

app.listen(PORT, () => {
    console.log("AMER AI يعمل على:");
    console.log(`http://localhost:${PORT}`);
});
