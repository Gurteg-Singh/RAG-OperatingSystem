const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const weaviate = require("weaviate-client");

async function semanticSearch(modifiedPrompt){
    try{
        //Embedding the question
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: 'text-embedding-004',
            });
        const queryVector = await embeddings.embedQuery(modifiedPrompt);

        // Fetching related chunks from Pinecone Database
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

        const searchResults = await pineconeIndex.query({
            topK: 10,
            vector: queryVector,
            includeMetadata: true,
        });

        return searchResults;
    }catch(err){
        throw new Error("ERROR : " + err.message);
    }
}

async function keywordSearch(modifiedPrompt){
    try{
        const weaviateURL = process.env.WEAVIATE_URL;
        const weaviateKey = process.env.WEAVIATE_API_KEY;

        const client = await weaviate.connectToWeaviateCloud(weaviateURL, {
            authCredentials: new weaviate.ApiKey(weaviateKey),
            skipInitChecks: true,
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