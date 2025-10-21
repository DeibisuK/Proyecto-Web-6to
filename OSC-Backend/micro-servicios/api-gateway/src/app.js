import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/p',proxy(process.env.PRODUCT_SERVICE_URL || ""));
app.use('/u',proxy(process.env.USER_SERVICE_URL || ""));
app.use('/c',proxy(process.env.COURT_SERVICE_URL || ""));
app.use('/m',proxy(process.env.MATCH_SERVICE_URL || ""));
//app.use('/b',proxy(process.env.BUY_SERVICE_URL || ""));
app.use('/i',proxy(process.env.CLOUDINARY_SERVICE_URL || ""));

export default app;






// // Service base URLs from environment
// const userServiceUrl = process.env.USER_SERVICE_URL || "";
// const productServiceUrl = process.env.PRODUCT_SERVICE_URL || "";

// // --- Inline proxy options (previously createProxyOptions/createPublicProxyOptions) ---
// // const proxyOptions = {
// //   proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
// //     proxyReqOpts.headers = proxyReqOpts.headers || {};
// //     if (srcReq.headers && srcReq.headers.authorization) {
// //       proxyReqOpts.headers.authorization = srcReq.headers.authorization;
// //     }
// //     if (srcReq.user) {
// //       proxyReqOpts.headers["x-user-uid"] = srcReq.user.uid || "";
// //       if (srcReq.user.email) proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
// //     }
// //     if (srcReq.tokenClaims && srcReq.tokenClaims.role) {
// //       proxyReqOpts.headers["x-user-role"] = srcReq.tokenClaims.role;
// //     }
// //     return proxyReqOpts;
// //   },
// // };

// // // Provide a couple of public route proxy option examples (used below)
// // const courtPublicProxyOptions = Object.assign({}, proxyOptions, {
// //   proxyReqPathResolver: function (req) {
// //     console.log(`[api-gateway] Public route ${req.path} accessed, forwarding to /sedes`);
// //     return "/sedes";
// //   },
// // });
// // const userPublicProxyOptions = Object.assign({}, proxyOptions, {
// //   proxyReqPathResolver: function (req) {
// //     console.log(`[api-gateway] Public route ${req.path} accessed, forwarding to /contacto`);
// //     return "/contacto";
// //   },
// // });

// // -------------------------
// // Admin routes (handled by gateway)
// // -------------------------
// // Order: authenticate -> authorizeRole -> admin routes
// // By convention, admin role id = 1 (adjust if your system differs)
// app.use("/admin", authenticate(), authorizeRole(1), adminRoutes);
// // app.post("/u/users", async (req, res) => {
// //   if (!userServiceUrl) {
// //     return res.status(500).json({
// //       error: "config_error",
// //       message: "USER_SERVICE_URL not configured",
// //     });
// //   }

// //   const endpoint = `${userServiceUrl.replace(/\/+$/, "")}/users/`;
// //   try {
// //     const response = await fetch(endpoint, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(req.body),
// //     });

// //     const text = await response.text();
// //     if (!response.ok) {
// //       console.error(
// //         "User service create responded with error:",
// //         response.status,
// //         text
// //       );
// //       return res.status(502).json({
// //         error: "user_service_error",
// //         status: response.status,
// //         message: text,
// //       });
// //     }

// //     let created;
// //     try {
// //       created = JSON.parse(text);
// //     } catch (e) {
// //       created = { raw: text };
// //     }

// //     // Try to fetch role name and set custom claims (best-effort)
// //     let claimsSynced = false;
// //     let claimWarning = null;
// //     try {
// //       const id_rol = req.body && req.body.id_rol;
// //       if (typeof id_rol !== "undefined" && id_rol !== null) {
// //         const rolesEndpoint = `${userServiceUrl.replace(
// //           /\/+$/,
// //           ""
// //         )}/roles/${encodeURIComponent(id_rol)}`;
// //         const roleResp = await fetch(rolesEndpoint, {
// //           method: "GET",
// //           headers: { "Content-Type": "application/json" },
// //         });
// //         let roleName = String(id_rol);
// //         if (roleResp.ok) {
// //           const roleObj = await roleResp.json();
// //           roleName = roleObj.nombre_rol || roleObj.name || roleName;
// //         }

// //         try {
// //           // Note: admin SDK should be initialised by your authenticate middleware
// //           await admin.auth().setCustomUserClaims(req.body.uid, {
// //             role: roleName,
// //             id_rol: Number(id_rol),
// //           });
// //           claimsSynced = true;
// //         } catch (err) {
// //           claimWarning = `failed_to_set_claims: ${
// //             err && err.message ? err.message : String(err)
// //           }`;
// //           console.error(
// //             "Failed to set custom claims for user on registration",
// //             req.body.uid,
// //             err
// //           );
// //         }
// //       }
// //     } catch (err) {
// //       claimWarning = `failed_to_sync_claims: ${
// //         err && err.message ? err.message : String(err)
// //       }`;
// //       console.error("Error during claims sync on user create", err);
// //     }

// //     return res.json({ success: true, created, claimsSynced, claimWarning });
// //   } catch (err) {
// //     console.error("Error creating user via user-service:", err);
// //     return res
// //       .status(500)
// //       .json({ error: "internal_error", message: err.message || String(err) });
// //   }
// // });

// app.use("/u/contacto", proxy(userServiceUrl, userPublicProxyOptions));
// app.use("/u", proxy(userServiceUrl));
// app.use("/p", proxy(productServiceUrl));
// app.use("/b", proxy(process.env.BUY_SERVICE_URL, proxyOptions));
// app.use("/c/sedes", proxy(process.env.COURT_SERVICE_URL, courtPublicProxyOptions));
// app.use("/c", proxy(process.env.COURT_SERVICE_URL, proxyOptions));
// app.use("/m",authenticate(), proxy(process.env.MATCH_SERVICE_URL, proxyOptions));
// app.use("/i", proxy(process.env.CLOUDINARY_SERVICE_URL, proxyOptions));

// Export configured Express app
//module.exports = app;
