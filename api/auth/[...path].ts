import authRoutes from "../../server/src/routes/authRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/auth", authRoutes);
