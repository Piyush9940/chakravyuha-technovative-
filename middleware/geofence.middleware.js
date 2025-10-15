import * as turf from "@turf/turf";
import Delivery from "../model/delivery.model.js";
export const geoFenceMiddleware = async (req, res, next) => {
 try{
    const { deliveryId } = req.params;
    const { latitude, longitude }=req.body;
    if(!latitude || !longitude || !deliveryId){
        return res.status(400).json({
            success:false,
            message:"All fields are required"

        }
        )
}
const delivery = await Delivery.findById(deliveryId);
if(!delivery){
    return res.status(404).json({
        success:false,
        message:"Delivery not found"
    })
}
const dropPoint=turf.point([delivery.dropLocation.lng, delivery.dropLocation.lat]);
const currentPoint=turf.point([parseFloat(longitude), parseFloat(latitude)]);
const distance = turf.distance(dropPoint, currentPoint, { units: "meters" });
    const allowedRadius = 200;
    if (distance <= allowedRadius) {
       
      req.geoFenceValidated=true;
      
      next();
    } else {
        return res.status(403).json({
            success:false,
            message:`Out side of safe delivery zone, delivery not possible.Distance from drop point: ${distance.toFixed(2)} meters`
        })


    }



 }
 catch{error}{
    console.log(error.message)
    return res.status(500).json({
        success:false,
        message:"internal Server error"
    })

 }
}