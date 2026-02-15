import inventoryRoutes from "../../server/src/routes/inventoryRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/inventory", inventoryRoutes);
