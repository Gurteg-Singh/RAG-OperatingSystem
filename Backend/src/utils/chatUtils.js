const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const weaviate = require("weaviate-client");

async function semanticSearch(modifiedPrompt){
    try{
        //Embedding the question
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: 'gemini-embedding-2-preview',
            });
        const queryVector = await embeddings.embedQuery(modifiedPrompt);
        
        // Fetching related chunks from Pinecone Database
        // const pinecone = new Pinecone();
        // const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
        // console.log("Pinecone connection done");

        // const searchResults = await pineconeIndex.query({
        //     topK: 10,
        //     vector: queryVector,
        //     includeMetadata: true,
        // });
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        const index = pc.index(process.env.PINECONE_INDEX, process.env.INDEX_HOST);
        const queryResponse = await index.namespace('__default__').query({
            vector: queryVector,
            topK: 10,
            includeValues: false,
            includeMetadata: true,
        });

        console.log("Pinecone fetch succesfull");
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
        console.log("Pinecone fetch succesfull");
        return response;
        

    }catch(err){
        throw new Error("ERROR : " + err.message);
    }
}

module.exports = {semanticSearch,keywordSearch};