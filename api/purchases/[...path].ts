import purchaseRoutes from "../../server/src/routes/purchaseRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/purchases", purchaseRoutes);
