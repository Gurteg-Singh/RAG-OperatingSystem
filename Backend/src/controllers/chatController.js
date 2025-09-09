const { GoogleGenAI } = require("@google/genai");
const {semanticSearch,keywordSearch} = require('../utils/chatUtils');



async function Chat(req,res){
    try{
        const {prompt,chatHistory} = req.body;
        if(!prompt){
            throw new Error("Please enter a valid prompt");
        }


        //Clarifying user's question 
        const modifyPrompt = new GoogleGenAI({});
        async function modify() {
            const chat = modifyPrompt.chats.create({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: `Hi, you are a great teacher who frames questions in a very clear way. Sometimes people ask questions 
                    that have no meaning until we know the whole conversation. So, you will take the question asked by the user and make it a
                    standalone question (a question that can be understood without knowing the whole chat) and return that standalone 
                    question. Just return the question, nothing else. If there is no chat history, simply return the same question, do 
                    nothing.

                    There are some important things to be careful about:
                        If the question is already complete and clear, do not reframe it.
                        Do not reframe a question if it is not related to any previous conversation.
                        You will only reframe the question if needed. Do not answer the question. Answering is strictly 
                        prohibited. This does not mean you tell the user you cannot answer; just return the question as-is or reframed.

                    Some special cases:
                    If a user asks a partial or follow-up question like “only tell about that part,” look at the previous conversation and 
                    convert it into a proper standalone question that captures the user’s intent. For example, if the topic was Blockchain, 
                    rewrite it as: “Would you like to tell me what you know about Blockchain even if you don’t fully know it?”
                    If the user is simply greeting like “hi,” “good morning,” “thanks,” or “I love you,” do not change it. Return it 
                    exactly as-is.

                    Other rules:
                    Never answer any question, even partially.
                    Only use previous conversation when necessary to make the question standalone. Do not add extra context.
                    If a follow-up looks like a continuation (“continue with MMC”), rewrite it as a standalone question 
                    (“Explain MMC in detail”) without giving the answer.`
                },
                history: chatHistory,
            });

            const response1 = await chat.sendMessage({
                message: prompt
            });
            return response1.text
        }
        const modifiedPrompt = await modify();

        const semanticSearchResults = await semanticSearch(modifiedPrompt);
        const keywordSearchResults = await keywordSearch(modifiedPrompt);


        const context1 = semanticSearchResults.matches.map(match => match.metadata.text).join("\n\n---\n\n");
        const context2 = keywordSearchResults.objects.map(val => val?.properties?.chunkText).join("\n\n---\n\n");
        const context = context1 + "\n\n---\n\n" + context2;


        // LLM to generate answer by reading text
        const ai = new GoogleGenAI({});
        async function main() {
            const chat = ai.chats.create({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: `Hi you are a Professor who teaches Operating System. You only follow one documnet and if someone ask you
                    a question you just look into that document. If you find a relevant answer in that document you answer it else you say sorry I can't
                    help you with that. When you are not having any answer you can apologize in any way you want. Remember you will answer from this
                    given document only : ${context}. Generating answer by your own if not present in document is not allowed. Strictly you only have to rely
                    on context given in the document. One more thing if user is not asking a question simply greeting like : thnaks,good morning,hi
                    etc, then you are allowed to greet them back. But if asking any question , simply answer from document only. If answer not present
                    apologize same way as ealier.`
                },
                history: [
                ],
            });

            const response1 = await chat.sendMessage({
                message: modifiedPrompt
            });
            return response1.text
        }
        const response = await main();
        
        res.status(200).send(response);

        
    }catch(err){
        res.status(401).json({
            message : err.message
        });
    }
}

module.exports= Chat;