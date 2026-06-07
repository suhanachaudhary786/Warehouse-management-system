
const Inventory =
    require("../models/Inventory");

const SKU =
    require("../models/SKU");

const Task =
    require("../models/Task");

const {
    findBestBin
}
    =
    require("../services/slottingService");

exports.receiveInventory =
    async (req, res) => {

        try {

            const {
                skuId,
                qty
            }
                =
                req.body;

            const sku =
                await SKU.findById(skuId);

            if (!sku) {
                return res.status(404).json({
                    success: false,
                    message: "SKU not found"
                });
            }

            const skuVolume =
                sku.length *
                sku.width *
                sku.height *
                qty;

            const bestBin =
                await findBestBin(
                    skuVolume,
                    sku.handlingClasses?.[0]
                );

            if (!bestBin) {
                return res.status(400).json({
                    success: false,
                    message: "No suitable bin found"
                });
            }

            const inventory =
                await Inventory.create({

                    sku: skuId,

                    qty,

                    status: "available",

                    bin: bestBin._id

                });

            const task =
                await Task.create({

                    taskType: "putaway",

                    inventory: inventory._id,

                    destinationBin: bestBin.code,

                    priority: 1

                });

            res.status(201).json({

                success: true,

                inventory,

                task

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };