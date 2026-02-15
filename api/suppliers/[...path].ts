import supplierRoutes from "../../server/src/routes/supplierRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/suppliers", supplierRoutes);
