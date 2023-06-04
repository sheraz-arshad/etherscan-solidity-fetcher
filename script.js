#!/usr/bin/env node
const fs = require('fs');
const getDirName = require('path').dirname;
const axios = require("axios");
const {mkdirp} = require('mkdirp');

const API_KEY = process.argv[2]; // PROVIDE API KEY
const chain = process.argv[3];
const address = process.argv[4]; // CHANGE CONTRACT'S ADDRESS

const chainUrlMap = {
    "ethereum": "etherscan.io",
    "bsc": "bscscan.com",
    "arbitrum": "arbiscan.io",
    "polygon": "polygonscan.com"
}
const url = `https://api.${chainUrlMap[chain.toLowerCase()]}/api?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`;
async function main() {
    // const {data} = await axios.get(url);
    // console.log(data)
    const {
        data: {
            result: [ {SourceCode} ]
        }
    } = await axios.get(url);
    const sourceCodeStringified = SourceCode.toString();
    if (sourceCodeStringified[0] !== "{") {
        fs.writeFileSync(address + ".sol", sourceCodeStringified)
    } else {
        let sourceCodeJSON;
        if (sourceCodeStringified.slice(0, 2) === "{{")
            sourceCodeJSON = JSON.parse(sourceCodeStringified.slice(1, sourceCodeStringified.length - 1));
        else
            sourceCodeJSON = JSON.parse(sourceCodeStringified);

        if (!!sourceCodeJSON.sources) sourceCodeJSON = sourceCodeJSON.sources;
        for (const contractPath of Object.keys(sourceCodeJSON)) {
            const pathWithRoot = address + "/" + contractPath;
            await mkdirp(getDirName(pathWithRoot));
            fs.writeFileSync(pathWithRoot, sourceCodeJSON[contractPath].content);
        }
    }
}

main().catch(err => console.error(err));
