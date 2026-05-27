const {GoogleGenAI} = require("@google/genai");
// const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const weaviate = require("weaviate-client");

async function semanticSearch(modifiedPrompt){
    try{
        //Embedding the question
        // const embeddings = new GoogleGenerativeAIEmbeddings({
        //     model: 'gemini-embedding-2-preview',
        //     });
        // const queryVector = await embeddings.embedQuery(modifiedPrompt);
        
        // Fetching related chunks from Pinecone Database
        // const pinecone = new Pinecone();
        // const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
        // console.log("Pinecone connection done");

        // const searchResults = await pineconeIndex.query({
        //     topK: 10,
        //     vector: queryVector,
        //     includeMetadata: true,
        // });
        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_API_KEY,
        });

        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: modifiedPrompt,
            config: {
                outputDimensionality: 768,
            },
        });
        const queryVector = response.embeddings[0].values;

        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pc.index(process.env.PINECONE_INDEX, process.env.INDEX_HOST);

        const queryResponse = await index.namespace('rag-project').query({
            vector: queryVector,
            topK: 10,
            includeValues: false,
            includeMetadata: true,
        });

        
        return queryResponse;
    }catch(err){
        console.log(err.message);
        throw new Error("ERROR : " + err.message);
    }
}

async function keywordSearch(modifiedPrompt){
    try{
        const weaviateURL = process.env.WEAVIATE_URL;
        const weaviateApiKey = process.env.WEAVIATE_API_KEY;

        const client = await weaviate.connectToWeaviateCloud(weaviateURL, {
            authCredentials: new weaviate.ApiKey(weaviateApiKey),
        });


        const article = client.collections.use("Article"); 
        response = await article.query.bm25(modifiedPrompt, {
            limit: 5,
            returnMetadata: ['score']
        });
        return response;
        

    }catch(err){
        throw new Error("ERROR : " + err.message);
    }
}

module.exports = {semanticSearch,keywordSearch};