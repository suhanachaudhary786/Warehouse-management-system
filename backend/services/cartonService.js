
const Carton =
    require("../models/Carton");

const suggestCarton =
    async (productVolume, totalWeight) => {

        const cartons =
            await Carton.find().sort({
                maxWeight: 1
            });

        for (const carton of cartons) {

            const cartonVolume =
                carton.length *
                carton.width *
                carton.height;

            if (
                cartonVolume >= productVolume &&
                carton.maxWeight >= totalWeight
            ) {
                return carton;
            }

        }

        return null;
    };

module.exports = {
    suggestCarton
};