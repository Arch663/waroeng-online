import categoryRoutes from "../../server/src/routes/categoryRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/categories", categoryRoutes);
