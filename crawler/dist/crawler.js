"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const url = __importStar(require("url"));
const elasticsearch_1 = require("@elastic/elasticsearch");
const elastic = new elasticsearch_1.Client({ node: 'http://localhost:9200' });
const startUrl = 'https://denmchenry.com/';
const visited = new Set();
const urlQueue = new Set();
const indexed = new Set();
function crawl(pageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (visited.has(pageUrl))
            return;
        visited.add(pageUrl);
        try {
            const { data } = yield axios_1.default.get(pageUrl);
            const $ = cheerio_1.default.load(data);
            console.log(`Crawling: ${pageUrl}`);
            $('a').each((i, link) => {
                const href = $(link).attr('href');
                if (href) {
                    const absoluteUrl = url.resolve(pageUrl, href);
                    if (absoluteUrl.startsWith('http')) {
                        urlQueue.add(absoluteUrl);
                    }
                }
            });
        }
        catch (error) {
            console.error(`Error crawling ${pageUrl}: ${error.message}`);
        }
        finally {
            indexed.add(pageUrl);
        }
    });
}
function crawlNext() {
    crawl(urlQueue.values().next().value);
    urlQueue.delete(urlQueue.values().next().value);
}
function indexToElastic() {
    return __awaiter(this, void 0, void 0, function* () {
        let indexedBuffer = new Set([...indexed]);
        indexed.clear();
        indexedBuffer.forEach((url) => __awaiter(this, void 0, void 0, function* () {
            yield elastic.index({
                index: 'urls',
                document: {
                    id: url
                }
            });
        }));
    });
}
crawl(startUrl);
setInterval(() => crawlNext(), 500);
setInterval(() => indexToElastic(), 5 * 1000);
setInterval(() => __awaiter(void 0, void 0, void 0, function* () { return yield elastic.indices.refresh({ index: 'urls' }); }), 60 * 1000);
