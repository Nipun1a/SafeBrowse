const ScanResult = require('../Models/ScanResults');
const googleSafeBrowsing = require('google-safebrowsing');
const calculateScore = require('../utils/calculateScore');


const scanController = async (req, res) => {
    try{
        const {url} = req.body;
        const domain = req.domain;

        // check if already scan and not expired 
        const existingscan = await ScanResult.findOne({domain, expires:{$gt: new Date()}});

        if(existingscan){
            return res.status(200).json({
                source: "cache",
                data: existingscan
            
            });

        } 
        
        // call google safe Browsing 
        const googleResult = await googleSafeBrowsing(url);

        // Calculate Score
        const score = calculateScore(googleResult);

        // Save result to database
        const newScan = await ScanResult.create({
            url,
            domain,
            score,
            threatDetails:{
                googleSafeBrowsing: googleResult
            
            },
            expiresAt: new Date(Date.now() + 24*60*60*1000) // 24 hours
        });

        // Send response 
        return res.status(200).json({
            source: "live-scan",
            data: newScan
        });
    }
    catch(error){
        console.error("Scan Error:", error);
        return res.status(500).json({error: "Internal Server Error"});
    }

};

module.exports = scanController;