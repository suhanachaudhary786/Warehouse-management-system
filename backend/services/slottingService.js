

const Bin = require("../models/Bin");
const Inventory = require("../models/Inventory");
const Task = require("../models/Task");

async function calculateRemainingVolume(binId) {
    const bin = await Bin.findById(binId);
    if (!bin) return 0;

    const inventories = await Inventory.find({ bin: binId }).populate("sku");
    const usedVolume = inventories.reduce((sum, inv) => {
        const sku = inv.sku;
        if (sku && sku.length && sku.width && sku.height) {
            const skuVolume = sku.length * sku.width * sku.height;
            return sum + (skuVolume * inv.qty);
        }
        return sum;
    }, 0);

    const remaining = bin.remainingVolume !== undefined ? bin.remainingVolume : bin.volumeCapacity;

    console.log(`📦 Bin ${bin.code}: capacity=${bin.volumeCapacity}, used=${usedVolume}, remaining=${remaining}`);

    return Math.max(0, remaining);
}


async function findBestBin(sku, quantity) {

    const bins = await Bin.find({ status: "AVAILABLE" });
    console.log(`     Total available bins: ${bins.length}`);

    if (bins.length === 0) {
        console.log("No available bins found!");
        return null;
    }

    // Calculate total volume and weight needed
    const unitVolume = (sku.length || 0) * (sku.width || 0) * (sku.height || 0);
    const totalVolume = unitVolume * quantity;
    const totalWeight = (sku.weight || 0) * quantity;

    console.log(`     Unit volume: ${unitVolume}, Total volume: ${totalVolume}`);
    console.log(`     Total weight: ${totalWeight} kg`);

    // Filter eligible bins
    const eligibleBins = [];

    for (const bin of bins) {
        const remainingVolume = await calculateRemainingVolume(bin._id);

        // Check volume
        if (remainingVolume < totalVolume) {
            console.log(`Bin ${bin.code}: Volume insufficient (need ${totalVolume}, have ${remainingVolume})`);
            continue;
        }

        // Check weight
        if (bin.maxWeight && bin.maxWeight < totalWeight) {
            console.log(`Bin ${bin.code}: Weight capacity exceeded (need ${totalWeight}, max ${bin.maxWeight})`);
            continue;
        }

        // Check handling classes
        if (sku.handlingClasses && sku.handlingClasses.length > 0) {
            const allowedClasses = bin.allowedHandlingClasses || [];
            const allAllowed = sku.handlingClasses.every(hc => allowedClasses.includes(hc));
            if (!allAllowed) {
                console.log(`Bin ${bin.code}: Handling classes not allowed`);
                continue;
            }
        }

        console.log(`Bin ${bin.code}: Eligible! Remaining volume: ${remainingVolume}`);
        eligibleBins.push(bin);
    }

    if (eligibleBins.length === 0) {
        console.log("No eligible bins found!");
        return null;
    }

    // Score each bin
    const scoredBins = await Promise.all(eligibleBins.map(async (bin) => {
        const remainingVolume = await calculateRemainingVolume(bin._id);
        const volumeFit = 1 - (totalVolume / remainingVolume);

        let velocityMatch = 0.5;
        if (sku.velocityClass === "FAST") velocityMatch = 1;
        if (sku.velocityClass === "SLOW") velocityMatch = 0;

        const proximityScore = (bin.x || 0) < 20 ? 1 : (bin.x || 0) < 50 ? 0.7 : 0.3;
        const score = (volumeFit * 0.5) + (velocityMatch * 0.3) + (proximityScore * 0.2);

        console.log(`     📊 Bin ${bin.code}: Score = ${score.toFixed(2)} (volume:${volumeFit.toFixed(2)}, velocity:${velocityMatch}, proximity:${proximityScore})`);

        return { bin, score };
    }));

    scoredBins.sort((a, b) => b.score - a.score);
    console.log(`Best bin: ${scoredBins[0].bin.code} with score ${scoredBins[0].score.toFixed(2)}`);

    return scoredBins[0].bin;
}


async function updateBinVolume(binId, sku, quantity, isAdding = true) {
    const bin = await Bin.findById(binId);
    if (!bin) return null;

    const skuVolume = (sku.length || 0) * (sku.width || 0) * (sku.height || 0);
    const volumeChange = skuVolume * quantity;

    if (isAdding) {
        bin.remainingVolume = (bin.remainingVolume || bin.volumeCapacity) - volumeChange;
        if (bin.remainingVolume <= 0) {
            bin.status = "FULL";
            bin.remainingVolume = 0;
        } else {
            bin.status = "AVAILABLE";
        }
    } else {
        bin.remainingVolume = (bin.remainingVolume || 0) + volumeChange;
        bin.status = "AVAILABLE";
    }

    await bin.save();
    return bin;
}



module.exports = {
    calculateRemainingVolume,
    findBestBin,
    updateBinVolume,
};