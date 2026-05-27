const {PDFLoader} = require("@langchain/community/document_loaders/fs/pdf");
const path = require("path");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
// const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const dotenv = require('dotenv');
dotenv.config();
const { Pinecone} = require("@pinecone-database/pinecone");
// const { PineconeStore } = require("@langchain/pinecone");
const weaviate = require("weaviate-client");
const { dataType } = weaviate;
const {GoogleGenAI} = require("@google/genai");


//OperatingSystemUoW.pdf


async function extractDoc(){
    try{
        const PDF_PATH = path.resolve(__dirname, "../resource/OperatingSystemUoW.pdf");
        const pdfLoader = new PDFLoader(PDF_PATH);
        const rawDocs = await pdfLoader.load();

        // Splitting into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200,
        });

        const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
        return chunkedDocs;
    }catch(err){
        console.log("ERROR : " + err.message);
    }
}

async function indexDocumentForSemanticSearch(){
    try{
        // GET CHUNKS OF DOCUMENT
        const chunkedDocs = await extractDoc();
        const texts = chunkedDocs.map(doc => doc.pageContent);

        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_API_KEY,
        });


        const response = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: texts,
            config: {
                outputDimensionality: 768,
            },
        });
        

        //Configure Vector Database
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX,process.env.INDEX_HOST);

        const vectors = response.embeddings.map((embedding, i) => ({
            id: `os-uow-chunk-${i}`,
            values: embedding.values,
            metadata: {
                text: chunkedDocs[i].pageContent,
                page: chunkedDocs[i].metadata?.loc?.pageNumber,
                source: chunkedDocs[i].metadata?.source,
            },
        }));

        const result = await pineconeIndex.namespace("rag-project").upsert(vectors);
        
        // //Configure embedding model
        // const embeddings = new GoogleGenerativeAIEmbeddings({
        //     model: 'gemini-embedding',
        //     config: { outputDimensionality: 768 },
        // });

        //Storing embedded chunks in database
        // await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        //     pineconeIndex,
        //     maxConcurrency: 5,
        //     namespace : "rag-project"
        // });

    }catch(err){
        console.log("ERROR : " + err.message);
    }
}

indexDocumentForSemanticSearch();

async function indexDocumentForKeywordSearch(){
    try{
        const weaviateURL = process.env.WEAVIATE_URL;
        const weaviateApiKey = process.env.WEAVIATE_API_KEY;

        const client = await weaviate.connectToWeaviateCloud(weaviateURL, {
            authCredentials: new weaviate.ApiKey(weaviateApiKey),
        });

        const exists = await client.collections.exists("Article"); // Returns a boolean

        if (!exists) {
            await client.collections.create({
                name: 'Article',
                properties: [
                {
                    name: 'chunkText',
                    dataType: dataType.TEXT,
                    indexSearchable: true,
                    indexFilterable: false,
                },
                ],
                invertedIndex: {
                    bm25: { b: 0.7, k1: 1.25 },
                    indexNullState: true,
                    indexPropertyLength: true,
                    indexTimestamps: true,
                },
            });
        }

        // GET CHUNKS OF DOCUMENT
        const chunkedDocs = await extractDoc();

        //Inserting data to cluster
        let dataToInsert = [];

        for(const val of chunkedDocs){
            const chunk = {
                chunkText : val?.pageContent
            }

            const objectToInsert = {
                properties : chunk
            }

            dataToInsert.push(objectToInsert);
        }

        const article = client.collections.use("Article");


        async function store(){
            try{
                const response = await article.data.insertMany(dataToInsert);
            }catch(err){
                console.log("ERROR : " + err.message);
            }
        }
        store();
        console.log("DATA STORED");
    }catch(err){
        console.log("ERROR : " + err.message);
    }
}

// indexDocumentForKeywordSearch();









