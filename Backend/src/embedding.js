const {PDFLoader} = require("@langchain/community/document_loaders/fs/pdf");
const path = require("path");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const dotenv = require('dotenv');
dotenv.config();
const { Pinecone} = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");

//notes (1).pdf
//OperatingSystemUoW.pdf
//R20CSE2202-OPERATING-SYSTEMS.pdf

async function indexDocument(){
    try{
        // Document Extraction
        const PDF_PATH = path.resolve(__dirname, "../resource/OperatingSystemUoW.pdf");
        const pdfLoader = new PDFLoader(PDF_PATH);
        const rawDocs = await pdfLoader.load();

        // Splitting into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200,
        });

        const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
        console.log(chunkedDocs.length);

        //Configure embedding model
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: 'text-embedding-004',
        });

        // const text = chunkedDocs.map((val)=> val?.pageContent);
        // console.log(text);
        // const vectors = await embeddings.embedDocuments(text);

        // console.log(vectors);
        

        //Configure Vector Database
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

    }catch(err){
        console.log("ERROR : " + err.message);
    }
}

indexDocument();



