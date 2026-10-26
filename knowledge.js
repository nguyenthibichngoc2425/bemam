import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const knowledge = require("./knowledge-base.json");

const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const stopWords = new Set(["va", "la", "gi", "cua", "mot", "cho", "the", "nao", "sao", "vi", "trong", "voi", "bi"]);

function tokens(value) {
  return normalize(value).split(/[^a-z0-9]+/u).filter((token) => token.length > 1 && !stopWords.has(token));
}

export function retrieveKnowledge(query, limit = 3) {
  const queryTokens = new Set(tokens(query));
  if (!queryTokens.size) return [];
  return knowledge
    .map((chunk) => {
      const haystack = tokens(`${chunk.title} ${chunk.subject} ${chunk.text}`);
      const matches = [...queryTokens].filter((token) => haystack.includes(token)).length;
      return { chunk, score: matches / queryTokens.size };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ chunk, score }) => ({ id: chunk.id, title: chunk.title, text: chunk.text, source: chunk.source, url: chunk.url, score: Number(score.toFixed(3)) }));
}
