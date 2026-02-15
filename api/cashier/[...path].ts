import cashierRoutes from "../../server/src/routes/cashierRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/cashier", cashierRoutes);
