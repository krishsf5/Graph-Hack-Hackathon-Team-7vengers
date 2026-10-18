import { FalkorDB } from 'falkordb';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
let graph = null;

const GRAPH_ID = process.env.FALKORDB_GRAPH_ID || 'FalkorBrain';

export async function getFalkorClient() {
  if (client) return client;

  let connectionOptions = {};
  if (process.env.FALKORDB_URL) {
    connectionOptions = { url: process.env.FALKORDB_URL };
  } else {
    connectionOptions = {
      host: process.env.FALKORDB_HOST || '127.0.0.1',
      port: Number(process.env.FALKORDB_PORT) || 6379,
      password: process.env.FALKORDB_PASSWORD || undefined,
      username: process.env.FALKORDB_USERNAME || undefined,
    };
  }

  try {
    client = await FalkorDB.connect(connectionOptions);
    const target = process.env.FALKORDB_URL || `${connectionOptions.host}:${connectionOptions.port}`;
    console.log(`[FalkorDB] Connected to ${target}`);
    return client;
  } catch (err) {
    console.error('[FalkorDB] Connection error:', err.message);
    throw err;
  }
}

export async function getGraph(graphId = GRAPH_ID) {
  if (graph) return graph;
  const falkor = await getFalkorClient();
  graph = falkor.selectGraph(graphId);
  return graph;
}

export async function closeFalkorConnection() {
  if (client) {
    await client.close();
    client = null;
    graph = null;
    console.log('[FalkorDB] Connection closed.');
  }
}
