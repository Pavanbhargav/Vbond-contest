import { Client,Account,Databases,Storage } from "appwrite";

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);


export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
export const COL_TASKS = process.env.NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID || "";
export const COL_SUBMISSIONS = process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID || "";
export const COL_USERS = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
export const COL_TRANSACTIONS = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || "";
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";